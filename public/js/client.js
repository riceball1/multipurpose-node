// client-side js


$(function() {
  $(".tipsList").on( "click", ".upvotes", function() {
    var button = $(this);
    var tipId = button.data('tipid');
    $.ajax({
      type: "POST",
      url: "/"+tipId+"/upvote",
      success: function(item){
        button.children().text(item.upvote)
      },
    });
  });
});


