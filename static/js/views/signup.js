$(document).ready(function(){

	var av = new AccountValidator();
// redirect to homepage when cancel button is clicked //
	$('#cancel-btn').click(function(){ window.location.href = '/';});

// redirect to homepage on new account creation, add short delay so user can read alert window //
	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			return av.validateForm();
		},
		success	: function(responseText, status, xhr, $form){
      window.location.href = '/';
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
			    av.showInvalidEmail();
			}	else{
        $('email-cg').text('');
      }
      if (e.responseText == 'username-taken'){
			    av.showInvalidUserName();
			}	else{
        $('user-cg').text('');
      }
		}
	});
	$('#name-tf').focus();

});
