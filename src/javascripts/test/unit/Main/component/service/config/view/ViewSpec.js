/*global require,describe,module,beforeEach,inject,it,expect*/

define(function (require) {
    'use strict';

    var View = require('ng-admin/Main/component/service/config/view/View'),
        Field = require('ng-admin/Main/component/service/config/Field'),
        Entity = require('ng-admin/Main/component/service/config/Entity'),
        ReferenceMany = require('ng-admin/Main/component/service/config/ReferenceMany'),
        Reference = require('ng-admin/Main/component/service/config/Reference');

    describe("Service: View config", function () {

        describe('name()', function() {
            it('should returns the view name.', function () {
                var view = new View('view-abx');
                expect(view.name()).toEqual('view-abx');
            });
            it('should return a default name based on the entity name and view type', function() {
                var view = new View();
                view.type = 'foo';
                var entity = new Entity('bar');
                view.setEntity(entity);
                expect(view.name()).toEqual('bar_foo');
            });
        });

        describe('title()', function() {
            it('should return false by default', function () {
                var view = new View();
                expect(view.title()).toBeFalsy();
            });
            it('should return the view title', function () {
                var view = new View();
                view.title('my-title');
                expect(view.title()).toEqual('my-title');
            });
        });

        describe('description()', function() {
            it('should return empty string by default', function () {
                var view = new View();
                expect(view.description()).toEqual('');
            });
            it('should return the view description', function () {
                var view = new View();
                view.description('my desc');
                expect(view.description()).toEqual('my desc');
            });
        });

        describe('addField()', function() {
            it('should add fields and preserve the order', function () {
                var view = new View();
                var refMany = new ReferenceMany('refMany');
                var ref = new Reference('myRef');

                var field = new Field('body');

                view.addField(ref).addField(refMany).addField(field);

                expect(view.getFieldsOfType('reference_many')['refMany'].name()).toEqual('refMany');
                expect(view.getReferences()['refMany'].name()).toEqual('refMany');
                expect(view.getReferences()['myRef'].name()).toEqual('myRef');
                expect(view.getFields()['body'].order()).toEqual(2);
            });
        });

        describe('fields()', function() {
            it('should return the fields when called with no arguments', function() {
                var view = new View();
                var field = new Field('body').order(1);
                view.addField(field);
                expect(JSON.stringify(view.fields()) == JSON.stringify({body: field})).toBeTruthy(); // deep object comparison is complicated in ES5
            });
            it('should add fields when called with an array argument', function() {
                var view = new View();
                var field1 = new Field('foo');
                var field2 = new Field('bar');
                view.fields([field1, field2]);
                expect(JSON.stringify(view.fields()) == JSON.stringify({foo: field1, bar: field2})).toBeTruthy();
            });
            it('should add a single field when called with a non array argument', function() {
                var view = new View();
                var field1 = new Field('foo');
                view.fields(field1);
                expect(JSON.stringify(view.fields()) == JSON.stringify({foo: field1})).toBeTruthy();
            });
            it('should add fields when called with several arguments', function() {
                var view = new View();
                var field1 = new Field('foo');
                var field2 = new Field('bar');
                view.fields(field1, field2);
                expect(JSON.stringify(view.fields()) == JSON.stringify({foo: field1, bar: field2})).toBeTruthy();
            });
            it('should add field collections', function() {
                var view1 = new View();
                var view2 = new View();
                var field1 = new Field('foo');
                var field2 = new Field('bar');
                view1.fields(field1, field2);
                view2.fields(view1.fields());
                expect(JSON.stringify(view2.fields()) == JSON.stringify({foo: field1, bar: field2})).toBeTruthy();
            });
        });

        it('should return the identifier.', function () {
            var view = new View();
            view
                .addField(new Field('post_id').identifier(true))
                .addField(new Field('name').identifier(false));

            expect(view.identifier().name()).toEqual('post_id');
        });

        it('should map some raw entities', function () {
            var view = new View();
            view
                .addField(new Field('post_id').identifier(true))
                .addField(new Field('title'))
                .setEntity(new Entity());

            var entries = view.mapEntries([
                { post_id: 1, title: 'Hello', published: true},
                { post_id: 2, title: 'World', published: false},
                { post_id: 3, title: 'How to use ng-admin', published: false}
            ]);

            expect(entries.length).toEqual(3);
            expect(entries[0].identifierValue).toEqual(1);
            expect(entries[1].values.title).toEqual('World');
            expect(entries[1].values.published).toEqual(false);
        });

        it('should map some one entity when the identifier in not in the view', function () {
            var view = new View(),
                field = new Field('title'),
                entity = new Entity('posts');

            view
                .addField(field)
                .setEntity(entity);

            entity
                .identifier(new Field('post_id'));

            var entry = view.mapEntry({ post_id: 1, title: 'Hello', published: true});
            expect(entry.identifierValue).toEqual(1);
            expect(entry.values.title).toEqual('Hello');
        });

    });
});
