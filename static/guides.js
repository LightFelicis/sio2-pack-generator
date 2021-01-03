$(document).ready(function () {
    $('#task-content').summernote();

    $('#flush-collapseTwo').on('show.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            'Here you can design task statement.' +
            ' </div>');
    });

    $('#flush-collapseThree').on('show.bs.collapse', function () {
        $('.card-body').replaceWith(
            '<div class="card-body"> ' +
            'Provide a sample input and output that will be appended to task description.' +
            ' </div>');
    });
});
