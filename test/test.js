var supertest = require("supertest");
var should = require("should");

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:3000");

// UNIT test begin

describe("Unit Test",function(){

  // #1 should return home page

  it("should return 200 Status",function(done){

    // calling home page api
    server
    .get("/healthz")
    .expect("Content-type",/json/)
    .expect(200) // THis is HTTP response
    .end(function(err,res){
        res.status.should.equal(200);
        res.type.should.equal("application/json")
        done();
    });
  });

});