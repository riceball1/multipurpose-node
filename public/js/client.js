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
    const tipid = button.data('tipid');
    const userid = button.data('userid');
    const itemid = button.data('itemid');
    $.ajax({
      type: "POST",
      url: "/"+tipid+"/deletetip",
      data: {
        "userid": userid,
        "itemid": itemid 
      },
      success: function(){
        button.remove();
      },
    });
  });
});


$(function() {
  $('#toggleForm').click(function() {
    $('#addSuggestions').toggle();
  });
});