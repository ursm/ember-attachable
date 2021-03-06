import  Ember from 'ember';
import { test, moduleForModel } from 'ember-qunit';
import Pretender from 'pretender';

var fileBlob,
    server;

moduleForModel('user', 'User model with attachement', {

  needs: 'adapter:application'.w(),

  setup: function(){
    // PhantomJS doesn't support Blob
    // var content = '<a id="a"><b id="b">hey!</b></a>';
    // fileBlob = new Blob([content], { type: "text/xml"});
    fileBlob = 'BLOB';

    // stub upload progress
    FakeXMLHttpRequest.prototype.upload = {};
  },

  teardown: function(){
    if (server){
      server.shutdown();
    }
  }

});

test('saves model with attachment', function(){
  expect(4);

  server = new Pretender(function(){
    this.post('/users', function(request){

      var constructorName = request.requestBody.constructor.name;
      if (constructorName){
        equal(constructorName, 'FormData', 'Should be instance of FormData');
      }else{
        ok(true, "Can't assert constructor of FormData instance in PhantomJs");
      }

      return [ 200,
        {
          "Content-Type": "application/json"
        },
        JSON.stringify({
          user: {
            id: 1,
            fileUrl: 'path/to/upload_file'
          }
        })
      ];
    });
  });

  var userModel = this.subject();
  userModel.set('file', fileBlob);

  var result;
  Ember.run(function(){
    result = userModel.saveWithAttachment();
  });

  result.then(function(createdUser){
    ok(createdUser.get('isLoaded'), 'record is in isLoaded state');
    equal(createdUser.get('id'), 1, 'id is set');
    equal(createdUser.get('fileUrl'), 'path/to/upload_file', 'fileUrl attr should be set from response payload');
  });
});

test('updates model with attachment', function(){
  expect(4);

  server = new Pretender(function(){
    this.put('/users/1', function(request){

      var constructorName = request.requestBody.constructor.name;
      if (constructorName){
        equal(constructorName, 'FormData', 'Should be instance of FormData');
      }else{
        ok(true, "Can't assert constructor of FormData instance in PhantomJs");
      }

      return [ 200,
      {
        "Content-Type": "application/json"
      },
      JSON.stringify({
        user: {
          id: 1,
          fileUrl: 'path/to/upload_file1'
        }
      })
      ];
    });
  });

  var store = this.subject().get('store');

  Ember.run(function(){
    store.push('user', {
      id: 1,
      firstName: 'John'
    });
  });

  var userModel = this.subject().get('store').getById('user', 1);
  userModel.set('file', fileBlob);

  var result;

  Ember.run(function(){
    result = userModel.saveWithAttachment();
  });

  result.then(function(createdUser){
    ok(createdUser.get('isLoaded'), 'record is in isLoaded state');
    equal(createdUser.get('id'), 1, 'id is set');
    equal(createdUser.get('fileUrl'), 'path/to/upload_file1', 'fileUrl attr should be updated from response payload');
  });
});

moduleForModel('book', 'Book model with attachements', {

  needs: 'adapter:application'.w(),

  setup: function(){
    // PhantomJS doesn't support Blob
    // var content = '<a id="a"><b id="b">hey!</b></a>';
    // fileBlob = new Blob([content], { type: "text/xml"});
    fileBlob = 'BLOB';

    // stub upload progress
    FakeXMLHttpRequest.prototype.upload = {};
  },

  teardown: function(){
    if (server){
      server.shutdown();
    }
  }

});

test('saves model with multiple attachments', function(){
  expect(4);

  server = new Pretender(function(){
    this.post('/books', function(request){

      return [ 200,
        {
          "Content-Type": "application/json"
        },
        JSON.stringify({
          book: {
            id: 1,
            coverUrl: 'path/to/cover',
            figureUrls: ['path/to/figure_1', 'path/to/figure_2']
          }
        })
      ];
    });
  });

  var bookModel = this.subject();
  bookModel.set('cover', fileBlob);
  bookModel.set('figures', [fileBlob, fileBlob]);

  var result;
  Ember.run(function(){
    result = bookModel.saveWithAttachment();
  });

  result.then(function(createdBook){
    ok(createdBook.get('isLoaded'), 'record is in isLoaded state');
    equal(createdBook.get('id'), 1, 'id is set');
    equal(createdBook.get('coverUrl'), 'path/to/cover', 'coverUrl attr should be set from response payload');
    deepEqual(createdBook.get('figureUrls'), ['path/to/figure_1', 'path/to/figure_2'], 'figureUrls attr should be set from response payload');
  });
});
