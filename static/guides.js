const task_statement_description = ["<p>Tutaj możesz zaprojektować treść zadania. Prosimy również o krótkie wyjaśnienie, jak sformatowane są dane wejściowe i wyjściowe. Na przykład, dane wejściowe mogą być pojedynczą liczbą, a dane wyjściowe odpowiadającą jej literą w alfabecie angielskim.</p>",
    "<p>Tytuł zadania oraz opis przykładowych testów zostaną automatycznie dodane do pakietu.</p>",
    "<p>Edytor używa łatwego do nauczenia się języka znaczników markdown.</p>",
    "<p>Użyj <strong title=\"Przełącz widok obok siebie (F9)\" tabindex=\"-1\" class=\"fa fa-columns no-disable no-mobile active\" style=\"display: inline\"></strong> na pasku narzędzi, aby przejść do widoku pełnoekranowego z podglądem, jak treść zadania będzie wyglądać dla uczestników (wyświetlonym po prawej stronie).</p>",
    "<p>Użyj <strong title=\"Przewodnik po Markdown\" tabindex=\"-1\" class=\"fa fa-question-circle\" href=\"https://simplemde.com/markdown-guide\" target=\"_blank\"></strong> na pasku narzędzi, aby uzyskać dostęp do ściągawki z Markdown.</p>",
    "<p>Oprócz standardowych elementów markdown, treść zadania może zawierać wyrażenia matematyczne zapisane w składni \\(\\LaTeX\\).</p>",
    "<p>Na przykład:</p>",
    "<p>\\\\<i></i>(x\\\\) w treści zadania zostanie przekształcone w \\(x\\)</p>",
    "<p>\\\\<i></i>(a + 2 \\cdot 7 = 3\\\\) w treści zadania zostanie przekształcone w \\(a + 2 \\cdot 7 = 3\\)</p>",
    "<p>\\\\<i></i>(b\\_{i + 2} \\cdot 12 + 7 = 3^{2+i}\\\\) w treści zadania zostanie przekształcone w \\(b_{i + 2} \\cdot 12 + 7 = 3^{2+i}\\)</p>",
    "<p><strong>Uwaga:</strong> w przeciwieństwie do \\(\\LaTeX\\), w Markdown musisz poprzedzić znak _ ukośnikiem (\\), ponieważ _ ma specjalne znaczenie.</p>",
    "<p>\\\\<i></i>(\\frac{2}{3}\\\\) w treści zadania zostanie przekształcone w \\(\\frac{2}{3}\\)</p>",
    "<p>\\\\<i></i>(1 \\leq n &lt; m \\leq 10^9\\\\) w treści zadania zostanie przekształcone w \\(1 \\leq n &lt; m \\leq 10^9\\)</p>",
    "<p>Możesz także używać znaczników $<i></i>$...$<i></i>$ lub \\\\[...\\\\] zamiast \\\\<i></i>(...\\\\), aby Twoje równania były wyświetlane w osobnych liniach.</p>"].join('');
    
const desc = {
    "tag-and-title": "Najpierw zaprojektuj tytuł i tag – krótką wersję tytułu, składającą się z 3-4 znaków. Na przykład, tytuł „Przygody Bajtosaurusa” to świetny tytuł, a „prz” może być jego odpowiadającym tagiem.",
    "task-statement" : task_statement_description,
    "sample-test" : "Ten test zostanie dołączony do treści zadania dla uczniów – będzie przedstawiony jako przykład. Kluczowe jest, aby przykład pasował do opisu danych wejściowych. Odpowiadające dane wejściowe dla poprzedniego przykładowego zadania mogłyby wynosić 3, a odpowiadające dane wyjściowe to litera 'c'.",
    "correctness-tests" : "Te testy nie będą widoczne dla uczniów. Zostaną użyte do oceniania ich rozwiązań, więc warto tutaj umieścić przypadki brzegowe. W naszym przykładzie przypadkiem brzegowym może być liczba odpowiadająca pierwszej i ostatniej literze alfabetu."
};
    
var testNum = 4;
const testNumMax = 8;

var queue_has_unstarted_mathjax_job = false;

$(document).ready(function () {

    // Not sure why such method call is necessary, but it seems it is.
    // Note that it specifies inline math delimiters, but displayed equations
    // with $$...$$ and \[...\] also do work (although sometime markdown treats
    // '\' specially so the second form is actually \\[...\\] to escape the escaping).
    MathJax.Hub.Config({
        tex2jax: {inlineMath: [["\\(","\\)"]]}
    });

    var simplemde = new SimpleMDE({
        element: $("#task-content")[0],
        // Spell checker works for english only, better to disable it.
        spellChecker: false,
        placeholder: "Napisz treść swojego zadania korzystając z markdown-a :-)",
        previewRender: function(plainText, preview) {

            // MathJax can be ordered to parse any DOM element that changed and has new math elements.
            // This has visual effect of math equations turning from plain text to parsed formulas.
            // As previewRender is called every time any change happens in editor buffer ordering MathJax
            // to parse math in preview causes constant effect of math repeatedly turning into plain text
            // and back to math formula form when typing text in editor with opened preview.
            // To fix this there is special new element on website with "mathjax-buffer" id and display set
            // to none. MathJax is ordered to parse math here and when it finishes the preview is being changed
            // to already parsed content.
            var mathjax_buffer = $("#mathjax-buffer")[0];

            // As MathJax is asynchronous and we need to do several synchronous tasks MathJax.Hub.Queue is used.
            // Elements added to this queue are callbacks, MathJax guarantees synchronous execution of elements
            // in this queue.
            // queue_has_unstarted_mathjax_job keeps whether there is a full unstarted job on MathJax queue so to
            // avoid adding too many jobs which slows the processing down drastically as previewRender is called
            // so many times that previous job to make preview might not have started yet.
            if (!queue_has_unstarted_mathjax_job) {
                queue_has_unstarted_mathjax_job = true;

                var that = this;
                MathJax.Hub.Queue(function() {
                    queue_has_unstarted_mathjax_job = false;
                    // that.parent is used because it happens to be SimpleMDE instance
                    // https://github.com/sparksuite/simplemde-markdown-editor/blob/6abda7ab68cc20f4aca870eb243747951b90ab04/src/js/simplemde.js#L1270
                    mathjax_buffer.innerHTML = that.parent.markdown(that.parent.value());
                });

                MathJax.Hub.Queue(["Typeset", MathJax.Hub, "mathjax-buffer"]);

                MathJax.Hub.Queue(function() {
                    preview.innerHTML = mathjax_buffer.innerHTML;
                    mathjax_buffer.innerHtml = "";
                });
            }
            // Return current preview value as new preview value (so it doesn't change the preview).
            // When jobs on queue will end they will change the preview to the new one.
            return preview.innerHTML;
        },
    });

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
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "card-body"]);
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
        const task_statement = simplemde.markdown(simplemde.value());
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
                link.download = tag + '.zip';
                link.click();
            })
            .catch((error) => {
                console.log("Error: ", error)
            })

    })
});
