(function(wb){

    /** Search filter */

    function highlightSearch(event) {
        var form = document.querySelector('.search > form');
        form.style.border = "1px solid #FFA500";
    }

    function unhighlightSearch(event) {
        var form = document.querySelector('.search > form');
        form.style.border = "1px solid #CCC";
    }


    var oldQuery = '';

    function searchBlock(event) {
        // Clear input if the clear button is pressed
        var searchTextNode = document.getElementById('search_text');

        if (event.target.id == 'search_clear') {
            searchTextNode.value = '';
        }

        // Proceed if the query is changed
        var query = searchTextNode.value.trim().toLowerCase();

        if (oldQuery == query) {
            return;
        } else {
            oldQuery = query;
        }

        var searchResultsNode = document.querySelector('.search-result');
        var blockMenuNode = document.querySelector('.block-menu');

        // For non-empty query, show all blocks; otherwise, hide all blocks
        if (query) {
            wb.show(searchResultsNode);
            wb.hide(blockMenuNode);

            while (searchResultsNode.firstChild) {
                searchResultsNode.removeChild(searchResultsNode.firstChild);
            }
        } else {
            wb.hide(searchResultsNode);
            wb.show(blockMenuNode);
            return;
        }

        // Clear suggestions
        var suggestions = [];
        var suggestionsNode = document.getElementById('search_suggestions');
        while (suggestionsNode.firstChild) {
            suggestionsNode.removeChild(suggestionsNode.firstChild);
        }

        var groups = document.querySelectorAll('.block-menu');

        for (var i = 0; i < groups.length; i++) {
            var blocks = groups[i].getElementsByClassName('block');

            for (var j = 0; j < blocks.length; j++) {
                // Construct an array of keywords
                var keywords = [];

                var group = blocks[j].getAttribute('data-group');
                if (group) {
                    keywords.push(group);
                }

                var keywordsAttr = blocks[j].getAttribute('data-keywords');
                if (keywordsAttr) {
                    keywords = keywords.concat(JSON.parse(keywordsAttr));
                }

                var tagsAttr = blocks[j].getAttribute('data-tags');
                if (tagsAttr) {
                    keywords = keywords.concat(JSON.parse(tagsAttr));
                }

                // Find a match
                var matchingKeywords = [];

                for (var k = 0; k < keywords.length; k++) {
                    if (keywords[k].indexOf(query) === 0) {
                        matchingKeywords.push(keywords[k]);

                        if (suggestions.indexOf(keywords[k]) == -1) {
                            suggestions.push(keywords[k]);

                            var suggestionNode = document.createElement('option');
                            suggestionNode.value = keywords[k];
                            suggestionsNode.appendChild(suggestionNode);
                        }
                    }
                }

                // Show/hide blocks
                if (matchingKeywords.length > 0) {
                    var resultNode = document.createElement('div');
                    resultNode.classList.add('search-result');
                    resultNode.classList.add(group);
                    resultNode.style.backgroundColor = 'transparent';

                    // Block
                    resultNode.appendChild(blocks[j].cloneNode(true));

                    // Fix result height
                    var clearNode = document.createElement('div');
                    clearNode.style.clear = 'both';
                    resultNode.appendChild(clearNode);

                    // Keyword name
                    var keywordNode = document.createElement('span');
                    keywordNode.classList.add('keyword');
                    var keywordNodeContent = '<span class="keyword">';
                    keywordNodeContent += '<span class="match">';
                    keywordNodeContent += matchingKeywords[0].substr(0, query.length);
                    keywordNodeContent += '</span>';
                    keywordNodeContent += matchingKeywords[0].substr(query.length);

                    for (var l = 1; l < matchingKeywords.length; l++) {
                        keywordNodeContent += ', <span class="match">';
                        keywordNodeContent += matchingKeywords[l].substr(0, query.length);
                        keywordNodeContent += '</span>';
                        keywordNodeContent += matchingKeywords[l].substr(query.length);
                    }

                    keywordNodeContent += '</span>';
                    keywordNode.innerHTML = keywordNodeContent;
                    resultNode.appendChild(keywordNode);

                    searchResultsNode.appendChild(resultNode);
                }
            }
        }
    }

    function toggleTag(evt){
        if (evt.detail.name.substring(0, 4) == 'tag-') {
            var groups = document.querySelectorAll('.submenu');

            for (var i = 0; i < groups.length; i++) {
                var blocks = groups[i].getElementsByClassName('block');
                var blocksHidden = 0;

                for (var j = 0; j < blocks.length; j++) {
                    var tagsAttr = blocks[j].getAttribute('data-tags');
                    var tags = [];

                    if (tagsAttr) {
                        tags = JSON.parse(tagsAttr);
                        if (tags.indexOf(evt.detail.name.substring(4)) > -1) {
                            if (evt.detail.state) {
                                wb.show(blocks[j]);
                            } else {
                                wb.hide(blocks[j]);
                                blocksHidden++;
                            }
                        }
                    }
                }

                if (blocksHidden == blocks.length) {
                    wb.hide(groups[i].previousSibling);
                    wb.hide(groups[i]);
                } else {
                    wb.show(groups[i].previousSibling);
                    wb.show(groups[i]);
                }
            }
        }
    }

    Event.on('#search_text', 'keyup', null, searchBlock);
    Event.on('#search_text', 'input', null, searchBlock);
    Event.on('#search_clear', 'click', null, searchBlock);
    Event.on('#search_text', 'focus', null, highlightSearch);
    Event.on('#search_text', 'blur', null, unhighlightSearch);


    Event.on(document.body, 'wb-toggle', null, toggleTag);

})(wb);
