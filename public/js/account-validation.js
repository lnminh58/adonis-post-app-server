const onActiveSuccess = res => {
  console.log(res);
  $("#activeResult").html(
    `<div class="alert alert-success mt-3">
      Your account has been activated!
      </div>`
  );
};

const onActiveError = err => {
  console.log(err);
  $("#activeResult").html(
    `<div class="alert alert-danger mt-3">
      Account activation failed!
      </div>`
  );
};

const getActivationToken = () => {
  const url = window.location.href;
  const params = url.substring(url.lastIndexOf("/") + 1, url.length);
  return params;
};

$(document).ready(function() {
  const activationToken = getActivationToken();
  const siteHost = window.location.host;
  $.ajax({
    type: "POST",
    url: `//${siteHost}/api/v1/users/active-account`,
    data: JSON.stringify({ activationToken }),
    success: onActiveSuccess,
    error: onActiveError,
    contentType: "application/json"
  });
});
