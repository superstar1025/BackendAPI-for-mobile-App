$(document).ready(function() {

  var alert = {
    warning: function(error) {
      var text = '';
      if (!$.isArray(error)) {
        text = error.message || error;
      } else {
        text = '<ul>';
        for (var i = 0; i < error.length; i++) {
          text += '<li>' + error[i].msg + '</li>';
        }
        text += '</ul>';
      }
      $('#alert_placeholder').html('<div class="alert alert-danger alert-dismissable">' +
      '<button type="button" class="close" data-dismiss="alert" aria-hidden="true" >&times;</button>' +
      text +
      '</div>');
    },
    success: function(message) {
      $('#alert_placeholder').html('<div class="alert alert-success alert-dismissable">' +
      '<button type="button" class="close" data-dismiss="alert" aria-hidden="true" >&times;</button>' +
      message +
      '</div>');
    }
  };

  var passwordResetSuccess = function(res) {
    $('#submit i').removeClass('glyphicon-refresh-animate');
    alert.success('Password changed successfully! Redirecting...');

    var idx = document.URL.search('/reset');
    var home = document.URL.substring(0, idx);
    setTimeout(function() {
      window.location.href = home;
    }, 3000);
  };

  var passwordResetError = function(res) {
    $('#submit i').removeClass('glyphicon-refresh-animate');
    alert.warning(res.responseJSON.error);
    $('#submit').removeAttr('disabled');
  };

  $('#submit').click(function() {
    $('.alert').alert('close');
    var password = document.getElementsByName('password')[0].value;
    var confirm = document.getElementsByName('confirm')[0].value;

    if (!password || password.length < 4) {
      return alert.warning('Password length should be at least 4 characters long!');
    }

    if (password !== confirm) {
      return alert.warning('Passwords do not match!');
    }

    $('#submit i').addClass('glyphicon-refresh-animate');
    $('#submit').attr('disabled', 'disabled');

    var arr = document.URL.split('/');
    var token = arr[arr.length - 1];

    $.ajax({
      method: 'POST',
      url: '/api/reset/' + token,
      data: {
        password: password,
        confirm: confirm
      },
      success: passwordResetSuccess,
      error: passwordResetError
    });

  });

});
