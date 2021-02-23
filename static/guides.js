const desc = {
    "tag-and-title": "First, design a title and a tag -- short version of title, 3-4 characters. For example title \"Bytesaurus adventures\" is a great title, and \"adv\" can be its corresponding tag.",
    "task-statement" : "Here you can design a task statement, please provide also a brief description on how the input and output is formatted. For example, an input can be a single number and output can be corresponding letter in english alphabet.",
    "sample-test" : "This test will be appended to task statement for students -- it will be presented as an example. It's crucial that example fits to input description. Corresponding input for previous examplanary task statement could be 3, and corresponding output could be c.",
    "correctness-tests" : "These tests won't be visible for your students. They will be used for grading their solutions, so it's good idea to put some edge cases here. In our example, possible edge case could be a number corresponding to first and last letter in alphabet."
}

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
});
