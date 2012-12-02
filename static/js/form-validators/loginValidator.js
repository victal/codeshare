
function LoginValidator(){

// bind a simple alert window to this controller to display any errors //



}

LoginValidator.prototype.validateForm = function()
{
	if ($('#user-tf').val() == ''){
    $('#user-cg').text('Please enter a valid username');
		return false;
	}
  $('#user-cg').text('');
  if ($('#pass-tf').val() == ''){
    $('#pass-cg').text('Please enter a valid password');
		return false;
	}
  $('#pass-cg').text('');
  return true;
}
