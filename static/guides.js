$(document).ready(function () {
    $('#task-content').summernote();

    $('#flush-collapseOne').on('show.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            'Here you can design task statement.' +
            ' </div>');
    });

    $('#flush-collapseOne').on('hide.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            'Click to expand!' +
            ' </div>');
    });

    $('#flush-collapseTwo').on('show.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            'Provide a sample input and output that will be appended to task description.' +
            ' </div>');
    });

    $('#flush-collapseTwo').on('hide.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            'Click to expand!' +
            ' </div>');
    });
});

console.log(':c');