document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#updateForm");
    const updateBtn = document.querySelector("button[type='submit']");

    if (form && updateBtn) {
        form.addEventListener("input", function (event) {
            if (event.target.name !== "inv_id") { 
                updateBtn.disabled = false; 
            }
        });
    }
});
