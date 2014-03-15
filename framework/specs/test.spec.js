describe("A test suite", function() {
  beforeEach(function() {
	 document.body.innerHTML = __html__['fixtures/javascript.html'];
	 //console.log(document.body.innerHTML);
  });
  afterEach(function() {
  });
 
  it('should fail', function() {
    expect(true).to.be.false;


  });
});
