// client-side js


$(function() {
  $(".tipsList").on( "click", ".upvotes", function() {
    var button = $(this);
    var tipId = button.data('tipid');
    $.ajax({
      type: "POST",
      url: "/"+tipId+"/upvote",
      success: function(item){
        button.children('.upcount').text(item.upvote)
      },
    });
  });
});


$(function() {
  $(".tipsList").on( "click", ".downvotes", function() {
    var button = $(this);
    var tipId = button.data('tipid');
    $.ajax({
      type: "POST",
      url: "/"+tipId+"/downvote",
      success: function(item){
        button.children('.downcount').text(item.downvote)
      },
    });
  });
});


$(function() {
  $(".user-tips").on( "click", ".delete-tip", function() {
    const button = $(this);
    console.log(button);
    console.log(button.parent());
    const tipid = button.data('tipid');
    const userid = button.data('userid').toString();
    const itemid = button.data('itemid').toString();
    const data = JSON.stringify({'userid': userid, 'itemid': itemid});
    $.ajax({
      type: "PUT",
      url: "/"+tipid+"/"+userid+"/"+itemid+"/deletetip",
      context: data,
      contentType: "application/json",
      success: function(){
        button.parent().css('display', 'none');
      }
    });
  });
});


$(function() {
  $('#toggleForm').click(function() {
    $('#addSuggestions').toggle();
  });
});