let links = [];
let isEdit = null;

const submit = function () {
    let data = $('form').serialize();
    if (isEdit) {
        data += '&isEdit=' + isEdit;
        isEdit = null;
        $('#submit').text('SUBMIT');
        $('#form h1').text('Add a new Bookmark!');
    }
    $.ajax({
        type: 'post',
        url: '/api/addLink',
        data: data,
        success: function (response) {
            if (response === true) {
                $('form')[0].reset();
                $('#linkstable').empty();
                getLinks();
            } else {
                switch (response) {
                    case 'duplicate':
                        alert("Link already stored!");
                        break;
                    case 'empty':
                        alert("Name or Link entry was empty!");
                        break;
                    default:
                        alert("Unknown Error!");

                }

            }
        }
    });
    return false;
};

const getLinks = function () {
    $.ajax({
        url: '/links',
        method: 'GET',
        success: function (data) {
            links = data;
            $('#linkstable').empty();
            $('#signupheader').remove();
            $('#loginheader').remove();
            $('#submit').prop('disabled', false);
            buildTable();
        },

        error: function (err) {
            console.log('Failed');
            $('#linkside').html('<h1 class="title">Please log in!</h1>')
            $('#logout').remove();
            $('#submit').prop('disabled', true);

        }
    });
};

const getTags = function (tag) {
    $.ajax({
        url: '/links/' + tag,
        method: 'GET',
        success: function (data) {
            links = data;
            $('#linkstable').empty();
            buildTable();
        },

        error: function (err) {
            console.log('Failed');
        }
    });
};

const edit = function (index) {
    $.each(links[index], function (key, value) {
        console.log(key, value);
        $('[id=' + key + ']', "form").val(value);
    });

    $('#submit').text('UPDATE');
    $('#form h1').text('Edit Bookmark!');
    isEdit = index;
};

const del = function (index) {
    $.ajax({
        type: 'post',
        url: '/api/deleteLink',
        data: {index: index},
        success: function (response) {
            if (response) {
                $('#linkstable').empty();
                getLinks();
            } else {
                alert("Error Deleting!");
            }
        }
    });
};

const buildTable = function () {
    $('#linkstable').append("<thead><tr><th/><th>Name</th><th>URL</th><th>Tags</th><th>Edit</th><th>Delete</th></tr></thead>");
    for (let i = 0; i < links.length; i++) {
        let link = links[i];
        let tags = '<span>';
        link.tags.forEach(tag => {
            tags += `<a href="#" onclick="getTags('${tag}')">${tag}</a>; `
        });
        tags += '</span>';
        let line = "<tr>";
        line += `<td><figure class="image is-24x24"><img src='${link.icon}'/></figure></td>`;
        line += `<td>${link.name}</td>`;
        line += `<td><a href='${link.url}'> ${link.url}</a></td>`;
        line += `<td>${tags}</td>`;
        line += `<td><a class='button is-info' id="edit" onclick="edit(${i})">Edit</a></td>`;
        line += `<td><a class='button is-danger' id="delete" onclick="del(${i})">Delete</a></td>`;
        line += "</tr>";
        $('#linkstable tr:last').after(line);
    }
};

window.onload = function () {
    const button = document.querySelector('#submit');
    button.onclick = submit;
    getLinks();
};
