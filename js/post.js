var posts;
var selectedTags = new Set();
var postsRangeStart = 0;
var postsRangeEnd = 10;

var request = new XMLHttpRequest();
request.open('GET', 'https://api.myjson.com/bins/152f9j');
request.responseType = 'json';
request.send();
request.onload = function () {
    var responseData = request.response;
    posts = responseData.data;

    lookupAndCreateTags(posts);
    processData(posts, selectedTags);

    document.getElementById("rb_asc").onchange = onDateSortingChange(posts);
    document.getElementById("rb_desc").onchange = onDateSortingChange(posts);

    var jumpToTopElement = document.getElementsByClassName('start')[0];
    jumpToTopElement.onclick = jumpToTop;
}


function createPost(postData, container) {
    let post = document.createElement('div')
    post.classList.add("post");
    let title = document.createElement('div')
    title.classList.add("title");
    title.innerHTML = postData.title;
    let description = document.createElement('div')
    description.classList.add("description");
    description.innerHTML = postData.description;
    let img = document.createElement('img')
    img.setAttribute('src', postData.image);
    let date = document.createElement('div')
    date.classList.add("date");
    date.innerHTML = new Date(postData.createdAt)
            .toLocaleString('ua-UA', { timeZone: 'UTC', hour12: false });
    let tags = document.createElement('div')
    tags.classList.add("tags");

    let allTags = '';
    for (var i = 0; i < postData.tags.length; i++) {
        if (i > 0) {
            allTags += ', '
        }
        allTags += postData.tags[i]
    }
    tags.innerHTML = allTags;

    post.appendChild(title);
    post.appendChild(description);
    post.appendChild(img);
    post.appendChild(date);
    post.appendChild(tags);

    container.appendChild(post);
}

function createAllTags(tagsSet, container) {
    let i = 0;
    tagsSet.forEach(function (item) {
        let tag = document.createElement('div');
        tag.classList.add("one-tag");
        let checkbox = document.createElement('input');
        checkbox.setAttribute("type", 'checkbox');
        checkbox.setAttribute("id", 'check' + i);
        tag.appendChild(checkbox);

        let label = document.createElement('label');
        label.setAttribute("for", 'check' + i);
        label.innerHTML = item;
        tag.appendChild(label);

        checkbox.onchange = onTagEnableDisable(item, checkbox, selectedTags);
        container.appendChild(tag);
        i++;
    });
}

function lookupAndCreateTags(dataArray) {
    let tags = new Set();
    dataArray.forEach(function (item) {
        item.tags.forEach(function (tag) {
            tags.add(tag);
        });
    });
    console.log(tags);
    var container = document.getElementsByClassName('date-tags')[0];
    createAllTags(tags, container);
}

function processData(dataArray, tagsSet) {

    sortByDate(dataArray, document.getElementById("rb_asc").checked);

    let filteredData;
    if (tagsSet.size > 0) {

        filteredData = filterByTags(dataArray, tagsSet);
        console.log(filteredData);

        filteredData.sort(tagPriorityComparatorFunc(tagsSet));
    } else {
        filteredData = dataArray;
    }

    var postsContainer = document.getElementsByClassName('container')[0];
    for (var i = postsRangeStart; i < postsRangeEnd && i < filteredData.length; i++) {
        createPost(filteredData[i], postsContainer);
    }
}

function sortByDate(dataArray, isAsceding) {
    return dataArray.sort(dateComparatorFunc(isAsceding));
}

function dateComparatorFunc(isAsceding) {
    var sign = isAsceding ? 1 : -1;
    return function (a, b) {
        return sign * (new Date(b.createdAt) - new Date(a.createdAt));
    }
}

function tagPriorityComparatorFunc(tagsSet) {
    return function (a, b) {
        let aNumOfTags = countContainingTags(a, tagsSet);
        let bNumOfTags = countContainingTags(b, tagsSet);

        return bNumOfTags - aNumOfTags;
    }
}

function countContainingTags(data, tagsSet) {
    let count = 0;
    data.tags.forEach(function (tag) {
        if (tagsSet.has(tag)) {
            count++;
        }
    });
    return count;
}

function filterByTags(dataArray, tagsSet) {
    let filtered = [];
    dataArray.forEach(function (item) {
        for (var i = 0; i < item.tags.length - 1; i++) {
            if (tagsSet.has(item.tags[i])) {
                filtered.push(item);
            }
        }
    });
    return filtered;
}

function clearPosts() {
    var postsContainer = document.getElementsByClassName('container')[0];
    while (postsContainer.firstChild) {
        postsContainer.removeChild(postsContainer.firstChild);
    }
}

function onDateSortingChange(postData) {
    return function () {
        clearPosts();
        processData(posts, selectedTags);
    }
}

function onTagEnableDisable(name, tag, tagSet) {
    return function () {
        if (tag.checked) {
            tagSet.add(name);
        } else {
            tagSet.delete(name);
        }
        clearPosts();
        processData(posts, selectedTags);
    }
}

window.onscroll = function() {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
        postsRangeStart += 10;
        postsRangeEnd += 10;
        processData(posts, selectedTags);
    }
}

function jumpToTop() {
    postsRangeStart = 0;
    postsRangeEnd = 10;
    clearPosts();
    window.scrollBy(0, -document.body.scrollHeight);
    processData(posts, selectedTags);
}