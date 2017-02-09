// client-side js
function getCount() {
  $.get('/the-count', function(data) {
    $('.js-current-count').text(data.count);
  });
}

$(function() {
  // getCount();
  // $('form').submit(function(event) {
  //   event.preventDefault();
  //   getCount();
  // });
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



/* HTML
<main>
<p>The count is: <span class="js-current-count">0</span></p>
<form>
<button type="submit">Increment server-side count</button>
</form>
</main>
*/

/* SERVER
// increment in the individual tips
app.get("/the-count", (req, res) => {
console.log('incrementing the count');
theCount += 1;
console.log(`the count is ${theCount}`);
res.json({count: theCount});
});
*/
