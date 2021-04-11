"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="favor" id="unchecked">&#9898;</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function getStory(evt){
  evt.preventDefault();

  const title = $("#submit-title").val();
  const author = $("#submit-author").val();
  const url = $("#submit-url").val();

  const story = await storyList.addStory(currentUser, {title, author, url});

  const storyHTML = generateStoryMarkup(story);
  $allStoriesList.prepend(storyHTML);

  $("#submit-story-form").hide();
}

$("#submit-story-btn").on("click", getStory);

function generateFavoriteMarkup() {
  $("#favorite-stories").empty();

  if (currentUser.favorites.length === 0){
    $("#favorite-stories").append("<h1>Empty</h1>");
  }
  else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $("#favorite-stories").append($story);
    }
  }
  $("#favorite-stories").show();
}

async function toggleFavorite(evt){
  const $li = $(evt.target).closest("li");
  const storyId = $li.attr("id");
  const story = storyList.stories.find(id => storyId === id);

  if ($(evt.target).attr(`id`) === "unchecked") {
    // $(evt.target).closest("span").val() = "&#9899;";
    $(evt.target).attr(`id`, `checked`);
    await currentUser.favoriteStory(story);
  }
  else if ($(evt.target).attr(`id`) === "checked") {
    // $(evt.target).val() = "&#9898;";
    $(evt.target).attr(`id`, `unchecked`);
    await currentUser.removeFavoriteStory(story);
  }
}  
// could've toggleClass'd somehow but I still don't completely understand it.

$allStoriesList.on("click", ".favor", toggleFavorite);