
function AccountValidator(){

// build array maps of the form inputs & control groups //

	this.formFields = [$('#name-tf'), $('#email-tf'), $('#user-tf'), $('#pass-tf')];
	this.controlGroups = [$('#name-cg'), $('#email-cg'), $('#user-cg'), $('#pass-cg')];

// bind the form-error modal window to this controller to display any errors //

	this.validateName = function(s)
	{
		return s.length >= 3;
	}

	this.validatePassword = function(s)
	{
	// if user is logged in and hasn't changed their password, return ok
    return s.length >= 6;
	}

	this.validateEmail = function(e)
	{
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(e);
	}

}

AccountValidator.prototype.showInvalidEmail = function()
{
	this.controlGroups[1].text(['That email address is already in use.']);
}

AccountValidator.prototype.showInvalidUserName = function()
{
	this.controlGroups[2].text(['That username is already in use.']);
}

AccountValidator.prototype.validateForm = function()
{
	var e = [];
	for (var i=0; i < this.controlGroups.length; i++) this.controlGroups[i].removeClass('error');
	if (this.validateName(this.formFields[0].val()) == false) {
		this.controlGroups[0].text('Please Enter Your Name');
	}
  else{
		this.controlGroups[0].text('');
  }
	if (this.validateEmail(this.formFields[1].val()) == false) {
		this.controlGroups[1].text('Please Enter A Valid Email');
	}
  else{
		this.controlGroups[1].text('');
  }
	if (this.validateName(this.formFields[2].val()) == false) {
		this.controlGroups[2].text('Please Choose A Username');
	}
  else{
		this.controlGroups[2].text('');
  }
	if (this.validatePassword(this.formFields[3].val()) == false) {
		this.controlGroups[3].text('Password Should Be At Least 6 Characters');
	}
  else{
		this.controlGroups[3].text('');
  }
	return e.length === 0;
}


