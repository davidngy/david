document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded event fired"); //debug

  document.querySelectorAll(".like").forEach(function (likeButton) {
    likeButton.addEventListener("click", function (event) {
        const postID = event.target.dataset.postId;
        const likeStatus = event.target.dataset.liked === 'true';
        const data = {
            liked: !likeStatus
        };

        updateLikeButton(postID, data);
    });
});

function updateLikeButton(postID, data) {
    fetch(`/likes/${postID}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(like => {
      console.log('Fetch Response:', like);
        const updatedLikeStatus = like.liked ? "Unlike" : "Like";
        const likeButton = document.querySelector(`.like[data-post-id="${postID}"]`)
        likeButton.textContent = updatedLikeStatus;

        const likeCountElement = document.getElementById(`like-count-${postID}`);
        likeCountElement.textContent = like.likes_count;
    });
}

 
// if u click on edit get the id and the content 
document.querySelectorAll(".edit").forEach(function (editButton) {
  editButton.addEventListener("click", function (event) {
    const postID = event.target.dataset.postId;
    const postContent = event.target.dataset.postContent;

    updateEditButton(postID, postContent);
  });
});
//here the right text area appears and you are able to make changes
function updateEditButton(postID) {
  // declare right value to each variable

  const editContainer = document.getElementById(`edit-container-${postID}`);
  let textarea = document.getElementById(`edit-textarea-${postID}`);
  const saveChangesButton = document.getElementById(`saveChangesButton-${postID}`);

  if (!editContainer || !textarea || !saveChangesButton) {
    console.error("One or more elements not found.");
  
  } else {
    fetch(`/textarea/${postID}/`)
        .then(response => response.json())
        .then(content => {
            console.log("Content from server:", content); // Log the entire content object
            
            document.getElementById(`post-content-${postID}`).style.display = "none";
            editContainer.style.display = "block";
            textarea.value = content.content;

            saveChangesButton.addEventListener("click", function () {
                const updatedContent = textarea.value;
                saveChanges(postID, updatedContent, editContainer);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
        
  }
}
//here you save the changes to django
function saveChanges(postID, updatedContent, editContainer) {

  console.log('updatedContentBeChange:', updatedContent);
  document.getElementById(`edit-textarea-${postID}`).innerHTML = updatedContent;
  document.getElementById(`post-content-${postID}`).style.display = "none";
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  
  // we send a request to our backend to update the content
  fetch(`/edit/${postID}/`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({
      'post_content': updatedContent
    })
  })
    .then(response => response.json())
    .then(updatedPost => {
      // document.getElementById(`post-content-${postID}`).innerHTML = updatedPost.post_content;
      editContainer.style.display = "none";
      
      

      // update the frontend to have the updated content
      let postContent = document.getElementById(`post-content-${postID}`)
      postContent.innerText = updatedPost.post_content;

      console.log('This should showing' + 'updatedContentEnd:', updatedContent);
      document.getElementById(`post-content-${postID}`).style.display = "block";

      //hide the textarea and show the post content
      

    });
}

});
