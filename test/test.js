var supertest = require("supertest");
var should = require("should");


var server = supertest.agent("http://localhost:3000");


describe("Unit Test",function(){ 

  it("should return 200 Status",function(done){

    server
    .get("/healthz")
    .expect("Content-type",/json/)
    .expect(200) 
    .end(function(err,res){
        res.status.should.equal(200);
        res.type.should.equal("application/json");
        done();
    });
  });

});