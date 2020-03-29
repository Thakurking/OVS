/* candidate.ejs javascript start */
$(document).ready(function() {
  //function for image preview genrator
  function preview(input, wrapper) {
    var reader = new FileReader();
    reader.onload = function(e) {
      path = "url('" + e.target.result + "')";
      $(wrapper).css("background", path);
    };
    reader.readAsDataURL(document.getElementById(input).files[0]);
  }

  $("#candidateImage").change(function() {
    preview("candidateImage", ".candidateImageWrapper");
  });
  $("#partySymbol").change(function() {
    preview("partySymbol", ".partySymbolWrapper");
  });

  // validators
  $("#candidateAddModal :input").keyup(function() {
    if (
      $("#name").val() != "" &&
      $("#email").val() != "" &&
      $("#phno").val() != "" &&
      $("#partyName").val() != "" &&
      $("#aadhar").val() != "" &&
      $("#about").val() != "" &&
      $("#candidateImage").val() != "" &&
      $("#partySymbol").val() != ""
    ) {
      $("#botn")
        .prop("disabled", false)
        .removeClass("disabled");
    } else {
      $("#botn")
        .prop("disabled", true)
        .addClass("disabled");
    }
  });
  $("#candidateImage,#partySymbol").change(function() {
    if (
      $("#name").val() != "" &&
      $("#email").val() != "" &&
      $("#phno").val() != "" &&
      $("#partyName").val() != "" &&
      $("#aadhar").val() != "" &&
      $("#about").val() != "" &&
      $("#candidateImage").val() != "" &&
      $("#partySymbol").val() != ""
    ) {
      $("#botn")
        .prop("disabled", false)
        .removeClass("disabled");
    } else {
      $("#botn")
        .prop("disabled", true)
        .addClass("disabled");
    }
  });

  // candidate add form submit action
  $("#botn").click(function() {
    var formData = new FormData();
    formData.append(
      "image",
      document.getElementById("candidateImage").files[0]
    );
    formData.append("image", document.getElementById("partySymbol").files[0]);
    formData.append("name", $("#name").val());
    formData.append("email", $("#email").val());
    formData.append("phno", $("#phno").val());
    formData.append("party", $("#partyName").val());
    formData.append("aadhar", $("#aadhar").val());
    formData.append("about", $("#about").val());
    $.ajax({
      url: "addCandidate",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function(data) {
        if (data[0] == false) $(".err-msg").append(data[1]);
        else window.location.reload();
      },
      error: function(data) {
        console.log(data);
      }
    });
  });

  // candidate del
  $(".candidateDel").click(function() {
    var del_id = $(this)
      .prop("disabled", true)
      .addClass("disabled")
      .html("<i class='fa fa-spinner'' aria-hidden='true''></i>")
      .closest("tr")
      .attr("data");
    if (del_id != null) {
      $.ajax({
        url: "delCandidate",
        type: "POST",
        data: { del_id: del_id },
        success: function(data) {
          if (data[0] == true) {
            window.location.reload();
          }
        },
        error: function(data) {
          console.log(data);
        }
      });
    }
  });

  // candidate update modal
  $(".candidateEdit").click(function() {
    var id = $(this)
      .closest("tr")
      .attr("data");
    // default image load
    $(".candidateImageWrapperU").css(
      "background",
      "url(" +
        $(this)
          .closest("tr")
          .find(".imageU")
          .children("img")
          .attr("src") +
        ")"
    );
    $(".partySymbolWrapperU").css(
      "background",
      "url(" +
        $(this)
          .closest("tr")
          .find(".symbolU")
          .children("img")
          .attr("src") +
        ")"
    );

    // image preview
    $("#candidateImageU").change(function() {
      $("#updateCandidateImage")
        .prop("disabled", false)
        .removeClass("disabled");
      preview("candidateImageU", ".candidateImageWrapperU");
    });
    $("#partySymbolU").change(function() {
      $("#updatePartySymbol")
        .prop("disabled", false)
        .removeClass("disabled");
      preview("partySymbolU", ".partySymbolWrapperU");
    });

    // candidate profile image upload
    $("#updateCandidateImage").click(function() {
      var formdata = new FormData();
      formdata.append(
        "image",
        document.getElementById("candidateImageU").files[0]
      );
      formdata.append("id", id);
      $.ajax({
        url: "updateCandidateImage",
        type: "POST",
        data: formdata,
        contentType: false,
        processData: false,
        success: function(data) {
          if (data[0] == true) {
            window.location.reload();
          }
        },
        error: function(data) {
          console.log(data);
        }
      });
    });

    // candidate party symbol upload
    $("#updatePartySymbol").click(function() {
      var formdata = new FormData();
      formdata.append(
        "image",
        document.getElementById("partySymbolU").files[0]
      );
      formdata.append("id", id);
      $.ajax({
        url: "updatePartySymbol",
        type: "POST",
        data: formdata,
        contentType: false,
        processData: false,
        success: function(data) {
          if (data[0] == true) {
            window.location.reload();
          }
        },
        error: function(data) {
          console.log(data);
        }
      });
    });

    // default text load
    $("#nameU").val(
      $(this)
        .closest("tr")
        .find(".nameU")
        .text()
    );
    $("#emailU").val(
      $(this)
        .closest("tr")
        .find(".emailU")
        .text()
    );
    $("#phnoU").val(
      $(this)
        .closest("tr")
        .find(".phnoU")
        .text()
    );
    $("#partyU").val(
      $(this)
        .closest("tr")
        .find(".partyU")
        .text()
    );
    $("#aadharU").val(
      $(this)
        .closest("tr")
        .find(".aadharU")
        .text()
    );
    $("#aboutU").val(
      $(this)
        .closest("tr")
        .find(".aboutU")
        .text()
    );

    $("#candidateUpdateModal :input").keyup(function() {
      if (
        $("#nameU").val() != "" &&
        $("#emailU").val() != "" &&
        $("#phnoU").val() != "" &&
        $("#partyU").val() != "" &&
        $("#aadharU").val() != "" &&
        $("#aboutU").val() != ""
      ) {
        $("#candidateDetailUpdate")
          .prop("disabled", false)
          .removeClass("disabled");
      } else {
        $("#candidateDetailUpdate")
          .prop("disabled", true)
          .addClass("disabled");
      }
    });
    // only text-updates

    $("#candidateDetailUpdate").click(function() {
      var candidate = {
        id: id,
        name: $("#nameU").val(),
        email: $("#emailU").val(),
        phone: $("#phnoU").val(),
        aadhar: $("#aadharU").val(),
        party: $("#partyU").val(),
        about: $("#aboutU").val()
      };

      $.ajax({
        url: "candidateDetailUpdate",
        type: "POST",
        data: { update: JSON.stringify(candidate) },
        success: function(data) {
          if (data[0] == true) window.location.reload();
        },
        error: function(data) {
          console.log(data);
        }
      });
    });
  });
});
/* candidate.ejs javacsript end */
