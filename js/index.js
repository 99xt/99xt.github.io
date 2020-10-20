new Konami("https://www.linkedin.com");

var timeSince = function(date) {

    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return date.toLocaleDateString('en-US');
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes ago";
    }
    if (seconds == 0) {
        return "just now";
    }
    return Math.floor(seconds) + " seconds";
};

var renderPage = function(data) {
    // hide preloader
    $('#preloader').fadeOut(300, function() {
        $(this).remove();
    });

    // repo name to category for repo mapping
    var repoToCategory = {};
    var categories = {};
    liRepoCategories.forEach(function(item) {
        var repos = item["repos"];
        var category = item["category"];
        categories[category] = category;
        repos.forEach(function(repoName) {
            repoToCategory[repoName] = category;
        });
    });

    // repo name to blog post for repo
    var repoToBlogPost = {};

    // repo name to documentation website for repo
    var repoToDoc = {};

    liRepoMetadata.forEach(function(item) {
        var repoName = item["repo"];
        var posts = item["posts"];
        repoToBlogPost[repoName] = posts;
        if ("doc" in item) {
            repoToDoc[repoName] = item["doc"];
        }
    });

    function getBlogposts(repo) {
        var blogListings = "";
        if (repoToBlogPost[repo]) {
            repoToBlogPost[repo].forEach(function(item) {
                var title = item["title"];
                var postUrl = item["url"];
                blogListings += "<a href='" + postUrl + "' target='_blank'>" + title + "</a><br />";
            });
            return blogListings;
        } else {
            return "";
        }
    }

    function getCategory(repo) {
        if (repoToCategory[repo]) {
            return repoToCategory[repo];
        } else {
            return "Other";
        }
    }

    function getLanguage(language) {
        if (language == null) {
            return "Other";
        } else {
            return language;
        }
    }

    function generateModalId(name) {
        return name.replace(new RegExp("\\.", "g"), "-") + "-modal";
    }

    function addModal(name, description, category, githubUrl, blogPosts, doc) {
        var modalId = generateModalId(name);
        var modalBody = description;
        if (blogPosts != "") {
            modalBody += "<br/><br/><b>Blog Posts</b><br/>";
            modalBody += blogPosts;
        }
        var modal = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h2 class="modal-title" id="myModalLabel">' + name + '</h2>' + buildCategoryLabel(category) +
            '</div>' +
            '<div class="modal-body">' +
            (modalBody==null ? "<em>No additional description</em>" : modalBody) + '</div>' +
            '<div class="modal-footer">';
        if (doc != "") {
            modal = modal + '<a class="btn btn-primary" href="' + doc + '" target="_blank">Documentation</a>  ';
        }
        modal = modal + '<a class="btn btn-primary" href="' + githubUrl + '" target="_blank">View on GitHub</a>'
        '</div></div></div></div>';
        $("#modals").append(modal);
    }

    function buildCategoryLabel(category) {
        var categorMap = {
            "Data": "default",
            "Frameworks": "primary",
            "SysOps": "success",
            "Testing": "info",
            "Mobile": "warning",
            "Other": "danger"
        }
        return '<span class="label project-label-' + categorMap[category] + '">' + category + '</span>';
    }

    function buildLanguageLabel(language) {
        var languageMap = {
            "Ruby": "red",
            "CSS": "green",
            "JavaScript": "blue",
            "C": "orange",
            "Mobile": "yellow",
            "C#": "brown",
            "TypeScript": "cadetblue",
            "PHP": "cornflowerblue",
            "HTML": "green",
            "XSLT": "brown",
            "Shell": "tomato",
            "Python": "dodgerblue",
            "Other": "purple",
        };

        return '<span class="col-lg-1 col-md-1 col-sm-1 col-xs-1 tag label project-label-' + languageMap[language] + '">' + language + '</span>';
    }


    var isotopeData = "";
    var languages = {};
    var githubData = null;
    if (data.meta.status == 403) {
        githubData = cachedGithubApiResponse;
        console.log("Using a cached API response.");
    } else {
        githubData = data.data;
    }

    // sort repo on latest activity first - using pushed at
    githubData.sort(function(a, b) {
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });
    githubData.forEach(function(item) {
        var language = getLanguage(item.language);
        if (languages[language] == undefined) {
            languages[language] = language;
        }
        var category = getCategory(item.name);
        isotopeData +=
            '<div class="col-lg-4 col-md-6 col-sm-12 col-xs-12 item-container"><div class="item ' + category.toLowerCase() + " " + language + ' col-lg-12 col-md-12 col-sm-12 col-xs-12">' +
            '<h3 class="col-lg-12 name">' + item.name + '</h3>' +
            '<button class="btn_git btn-with-count js-toggler-target"> ' + '<i class="icon-star"></i>' + item.stargazers_count + ' Stars </button>&nbsp' +
            '<button class="btn_git btn-with-count js-toggler-target">' + '<i class="icon-fork"></i>' + item.forks + ' Forks </button>' +
            '<p class="size hidden">' + item.size + '</p>' +
            '<p class="forks hidden">' + item.forks + '</p>' +
            '<p class="watchers hidden">' + item.watchers_count + '</p>' +
            '<p class="col-lg-12 proj-disc">' + (item.description==null ? "<em>No additional description</em>" : item.description) + '</p>' +
            '<div class="col-lg-12 language-tags">' +
            buildLanguageLabel(language) +
            '</div>' +
            '</div></div>';
        var doc;
        if (item.name in repoToDoc) {
            doc = repoToDoc[item.name];
        } else {
            doc = "";
        }
        addModal(item.name, item.description, category, item.html_url, getBlogposts(item.name), doc);
    });

    var container = $('#isotope-container');
    container.append(isotopeData);

    //TODO remove in #106
    // initialize Isotope
    /*$("#isotope-container").isotope({
        // options
        itemSelector: '.item',
        layoutMode: 'masonry',
        getSortData: {
            forks: function(elem) {
                return parseInt($(elem).find(".forks").text(), 10);
            },
            size: function(elem) {
                return parseInt($(elem).find(".size").text(), 10);
            },
            watchers: function(elem) {
                return parseInt($(elem).find(".watchers").text(), 10);
            },
            name: function(elem) {
                return $(elem).find(".name").text();
            }
        }
    });*/

    // Modals
    $(".item").click(function() {
        var repo = $($(this).find("h3")[0]).html();
        var modal = generateModalId(repo);
        var modalSelector = "#" + modal;
        $(modalSelector).modal();
    });

    // Isotope filters
    $(".filter").click(function() {
        var selector = $(this).html().toLowerCase();
        if (selector == "all") {
            selector = "*";
        } else {
            selector = "." + selector;
        }
        $("#isotope-container").isotope({
            filter: selector
        });
    });

    // Isotope sorting
    $(".sort").click(function() {
        var sortName = $(this).attr("data-option-value");
        var isAscending = false;
        if (sortName == "name") {
            isAscending = true;
        }
        $('#isotope-container').isotope({
            sortBy: sortName,
            sortAscending: isAscending
        });
    });

    // Random color to project cards
    $(".border-fade").each(function(index) {
        var color = randomColor({
            luminosity: 'bright',
            format: 'rgb' // e.g. 'rgb(225,200,20)'
        });
        // Set random border color fo each project card
        $(this).css('box-shadow', `inset 0 0 0 4px ${color},0 0 1px rgba(0,0,0,0)`);

        // Mouse events for project cards
        $(this).on('mouseover', function(event) {
            $(this).css('box-shadow', `inset 0 0 0 6px #ddd,0 0 1px rgba(0,0,0,0)`);
        }).mouseout(function(event) {
            $(this).css('box-shadow', `inset 0 0 0 4px ${color},0 0 1px rgba(0,0,0,0)`);
        });
    });
};

function renderOrgEvents(data) {
    data.filter(function (event) {
        var title = "";
        var timeStamp = "<span class='time-stamp'>" + timeSince(new Date(event.created_at)) + "</span>";
        var description = " ";
        var repo = "<a href='https://github.com/" + event.repo.name + "'>" + event.repo.name + "</a>";
        var actor = "<a href='https://github.com/"+ event.actor.login +"'>"+
          "<img class='actor-avatar' src='" + event.actor.avatar_url + "'/>" +
          event.actor.display_login +
          "</a>";

        if (event.payload && event.payload.pull_request && event.payload.pull_request.merged) {
          event.payload.action = "merged";
        }

        var action = "<span class='action action-" + event.payload.action + "' >" + event.payload.action + "</span>";

        switch (event.type) {
          case "WatchEvent":
            title = actor + " " + action + " watching " + repo;
            description += "";
            break;

          case "PushEvent":
            title = actor + " pushed " + event.payload.size + " commits to "+ repo;
            description += "";
            description += "<ul class='col-lg-12 commits-list'>";

            for (var i = 0; i < event.payload.size; i++) {
              var commitObject = event.payload.commits[i];
              var commit = "<li class='col-lg-12 '><a class='col-lg-12' href='https://github.com/" + event.repo.name + "/commit/" + commitObject.sha + "'>" + commitObject.sha + "</a></li>";
              description += commit;
            }

            description += "</ul>";
            break;

          case "PullRequestEvent":
            title = actor + " " + action + " a pull request" + repo;
            description += "<a href='" + event.payload.pull_request.html_url + "'><strong>#" + event.payload.pull_request.number + " " + event.payload.pull_request.title + "</strong></a>";
            break;

          case "IssueCommentEvent":
            title = actor + " commented on a " + (event.payload.issue.pull_request ? "pull request" : "issue") + " in " + repo;
            description += "<a href='" + event.payload.comment.html_url + "'><strong>#" + event.payload.issue.number + " " + event.payload.issue.title + "</strong></a>";
            break;

          case "ForkEvent":
            title = actor + " forked " + repo + " to " + "<a href='" + event.payload.forkee.html_url + "'>" + event.payload.forkee.full_name + "</a>";
            break;

          case "IssuesEvent":
            title = actor + " " + action + " an issue in " + repo;
            description += "<a href='" + event.payload.issue.html_url + "'><strong>#" + event.payload.issue.number + " " + event.payload.issue.title + "</strong></a>";
            break;

          case "PullRequestReviewCommentEvent":
            title = actor + " reviewed a pull request " + " in " + repo;
            description += "<a href='" + event.payload.comment.html_url + "'><strong>#" + event.payload.pull_request.number + " " + event.payload.pull_request.title + "</strong></a>";
            debugger;
            break;
        }

        $("#organization-repo-events").append("<div class='col-lg-12 organization-repo-event'>" +
             "<div class='col-lg-12 activity-title'>" + title + "</div>" +
            "<div class='col-lg-12 activity-description'>" + description + "</div>" +
            "<div class='col-lg-12 text-right activity-footer'>" + timeStamp + "</div>"+
        "</div>");
    });
}

$.getJSON(window.location.origin+"/config.json", function(config) {
    var item = $("#isotope-container").html();
    for (var i =0; i < 15; i++) {
      //$("#isotope-container").append(item);
    }
    $.ajax({
        dataType: 'json',
        url: 'https://api.github.com/orgs/' + config.git_org_name + '/repos?page=1&per_page=100&callback=?',
        success: renderPage
    });

    $.ajax({
        dataType: 'json',
        url: 'https://api.github.com/orgs/' + config.git_org_name + '/events',
        success: renderOrgEvents
    });

    document.title = config.title;
    $(".href").attr('href', config.base_url);
    $(".git_url").attr('href', 'http://github.com/' + config.git_org_name);
    $(".blog_url").attr('href', config.blog_url);
    $(".logo").attr('src', config.logo_url);
    $(".gsoc").attr('href', config.child_url + 'gsoc');
    $(".gsod").attr('href', config.child_url + 'gsod');
    $(".events").attr('href', config.child_url + 'events');
    $("#title_main").html("Open Source by " + config.org_name);
});