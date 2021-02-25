const desc = {
    "tag-and-title": "First, design a title and a tag -- short version of title, 3-4 characters. For example title \"Bytesaurus adventures\" is a great title, and \"adv\" can be its corresponding tag.",
    "task-statement" : "Here you can design a task statement, please provide also a brief description on how the input and output is formatted. For example, an input can be a single number and output can be corresponding letter in english alphabet.",
    "sample-test" : "This test will be appended to task statement for students -- it will be presented as an example. It's crucial that example fits to input description. Corresponding input for previous examplanary task statement could be 3, and corresponding output could be c.",
    "correctness-tests" : "These tests won't be visible for your students. They will be used for grading their solutions, so it's good idea to put some edge cases here. In our example, possible edge case could be a number corresponding to first and last letter in alphabet."
}

var testNum = 4;
const testNumMax = 8;

$(document).ready(function () {
    $('#task-content').summernote();

    $('#flush-collapseOne').on('show.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            desc["tag-and-title"] +
            ' </div>');
    });

    $('#flush-collapseTwo').on('show.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            desc["task-statement"] +
            ' </div>');
    });

    $('#flush-collapseThree').on('show.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            desc["sample-test"] +
            ' </div>');
    });

    $('#flush-collapseFour').on('show.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            desc["correctness-tests"] +
            ' </div>');
    });

    $(document).on('click', '#add-more-tests', function () {
        $('#tests-inputs').append(
            '<div class="input-group">\
                    <textarea class="form-control input" name="input" placeholder="Input" style="width:40%"></textarea>\
                    <textarea class="form-control output" name="output" placeholder="Output" style="width:40%"></textarea>\
                    <button type="button" class="btn btn-default remove-single-test" aria-label="Left Align">\
                        <span class="fa fa-trash-o fa-lg" aria-hidden="true"></span>\
                    </button>\
            </div>'
        );
        testNum++;
        if (testNum >= testNumMax) {
            $("#add-more-tests").attr("disabled", true);
        }
    });

    $(document).on('click', '.remove-single-test', function () {
        $(this).parent().remove();
        testNum--;
        if (testNum < testNumMax) {
            $("#add-more-tests").attr("disabled", false);
        }
    });

    $(document).on('click', '.button-submit', function () {
        const tag = $('#task-tag').val();
        const title = $('#task-title').val();
        const task_statement = $("#task-content").summernote('code');
        const example_in = $('#example-input').val();
        const example_out = $('#example-output').val();
        let tests = [];
        $('#tests-inputs').children('.input-group').each(function() {
            const input = $(this).children('.input').val();
            const output = $(this).children('.output').val();
            tests.push({'input': input, 'output': output});
        });
        const post_data = JSON.stringify({
            'tag': tag,
            'title': title,
            'task_statement': task_statement,
            'exemplary_test': {'input': example_in, 'output': example_out},
            'tests': tests
        })
        console.log(post_data)

        fetch('/task', {
            credentials: "same-origin",
            mode: "same-origin",
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: post_data
        }).then(response => response.blob())
            .then(zipFile => {
                console.log(zipFile)
                let blob = zipFile;
                let link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = tag;
                link.click();
            })
            .catch((error) => {
                console.log("Error: ", error)
            })

    })
});
