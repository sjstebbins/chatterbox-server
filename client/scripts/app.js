
var Message = Backbone.Model.extend({
  url: 'http://127.0.0.1:3000/classes/messages'
});

var Messages = Backbone.Collection.extend({

  model: Message,
  url: 'http://127.0.0.1:3000/classes/messages',

  loadMsgs: function(){
    this.fetch({data: { order: '-createdAt' }});
  },

  parse: function(response, options){
    var results = [];
    for( var i = response.results.length-1; i >= 0; i-- ){
      results.push(response.results[i]);
    }
    return results;
  }

});

var FormView = Backbone.View.extend({

  template: _.template('<h1>chatter<em>box</em></h1> \
      <!-- Your HTML goes here! --> \
      <div class="spinner"><img src="images/spiffygif_46x46.gif"></div> \
      <form action="#" id="send" method="post"> \
        <input type="text" name="message" id="message"/> \
        <input type="submit" name="submit" class="submit"/> \
      </form>'),

  events: {
    'submit form': 'handleSubmit'
  },

  initialize: function(){
    this.collection.on( 'sync', this.stopSpinner, this );
  },

  render: function(){
    this.$el.html(this.template());
    return this.$el;
  },

  handleSubmit: function(e){
    e.preventDefault();

    var $text = this.$('#message');

    this.collection.create({
      username: window.location.search.substr(10),
      text: $text.val()
    });

    $text.val('');
  },

  startSpinner: function(){
    this.$('.spinner img').show();
    this.$('form input[type=submit]').attr('disabled', "true");
  },

  stopSpinner: function(){
    this.$('.spinner img').fadeOut('fast');
    this.$('form input[type=submit]').attr('disabled', null);
  }

});

var MessagesView = Backbone.View.extend({

  initialize: function(){
    this.collection.on( 'sync', this.render, this );
    this.onscreenMessages = {};
    this.blockedUsers = ['BRETTSPENCER', 'Chuck Norris'];
  },

  render: function(){
    this.collection.forEach(this.renderMessage, this);
    return this.$el;
  },

  renderMessage: function(message){
    if( this.blockedUsers.indexOf(message.get('username')) < 0 ){
      if( !this.onscreenMessages[message.get('objectId')] ){
        var messageView = new MessageView({model: message});
        this.$el.prepend(messageView.render());
        this.onscreenMessages[message.get('objectId')] = true;
      }
    }
  }

});

var MessageView = Backbone.View.extend({

  template: _.template('<div class="chat" data-id="<%= objectId %>"><div class="user"><%= username %></div><div class="text"><%- text %></div></div>'),

  render: function(){
    this.$el.html(this.template(this.model.attributes));
    return this.$el;
  }

});

var ChartView = Backbone.View.extend({

  getPerUserMessageCount: function(){
    var users = {};
    this.collection.forEach(function(message,index){
      users[message.get('username')] = users[message.get('username')] || 0;
      users[message.get('username')]++;
    });
    return users;
  },

  constructColumnsArray: function(priorData){
    var users = this.getPerUserMessageCount();
    var result = [];
    var data;
    if (priorData){
      _.each(priorData, function(valueSet) {
         data = _.pluck(valueSet.values,'value');
         if (users[valueSet.id]){
          users[valueSet.id] = data.concat(users[valueSet.id]);
         } else {
          users[valueSet.id] = data;
         }
      });
    }
    for (var user in users) {
      result.push([user].concat(users[user]));
    }
    return result;
  },

  initialize: function(){
    this.render();
    this.collection.on('add',function(){
      if (this.collection.length !== this.messageLength){
        this.chart.load({
          columns: this.constructColumnsArray(this.chart.data())
        });
        this.messageLength = this.collection.length;
      }
    },this);
  },

  render: function(){
    this.chart = c3.generate({
      bindto: '#chart',
      data: {
        columns: this.constructColumnsArray()
      }
    });
  }

});


// YOUR CODE HERE:
app = {

    server: 'https://api.parse.com/1/classes/chatterbox/',

    init: function() {
      console.log('running chatterbox');
      // Get username
      app.username = window.location.search.substr(10);

      app.onscreenMessages = {};
      app.blockedUsers = ['BRETTSPENCER', 'Chuck Norris'];

      // cache some dom references
      app.$text = $('#message');


      app.loadMsgs();
      setInterval( app.loadMsgs.bind(app), 1000);

      $('#send').on('submit', app.handleSubmit);
    },

    handleSubmit: function(e){
      e.preventDefault();

      var message = {
        username: app.username,
        text: app.$text.val()
      };

      app.$text.val('');

      app.sendMsg(message);
    },

    renderMessage: function(message){
      var $user = $("<div>", {class: 'user'}).text(message.username);
      var $text = $("<div>", {class: 'text'}).text(message.text);
      var $message = $("<div>", {class: 'chat', 'data-id': message.objectId }).append($user, $text);
      return $message;
    },

    displayMessage: function(message){
      if( app.blockedUsers.indexOf(message.username) < 0 ){
        if( !app.onscreenMessages[message.objectId] ){
          var $html = app.renderMessage(message);
          $('#chats').prepend($html);
          app.onscreenMessages[message.objectId] = true;
        }
      }
    },

    displayMessages: function(messages){
      for( var i = 0; i < messages.length; i++ ){
        app.displayMessage(messages[i]);
      }
    },

    loadMsgs: function(){
      $.ajax({
        url: app.server,
        data: { order: '-createdAt' },
        contentType: 'application/json',
        success: function(json){
          app.displayMessages(json.results);
        },
        complete: function(){
          app.stopSpinner();
        }
      });
    },

    sendMsg: function(message){
      app.startSpinner();
      $.ajax({
        type: 'POST',
        url: app.server,
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function(json){
          message.objectId = json.objectId;
          app.displayMessage(message);
        },
        complete: function(){
          app.stopSpinner();
        }
      });
    },

    startSpinner: function(){
      $('.spinner img').show();
      $('form input[type=submit]').attr('disabled', "true");
    },

    stopSpinner: function(){
      $('.spinner img').fadeOut('fast');
      $('form input[type=submit]').attr('disabled', null);
    }
};
