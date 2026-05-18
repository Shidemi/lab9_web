document
.getElementById('loadBtn')
.addEventListener('click', loadTaxes);

async function loadTaxes() {

    try {

        let response =
            await fetch('/items');

        let data =
            await response.json();

        let html = `
        <table>

        <tr>
            <th>ID</th>
            <th>Налог</th>
            <th>Описание</th>
            <th>Ставка</th>
        </tr>
        `;

        data.forEach(item => {

            html += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.description}</td>
                <td>${item.rate}</td>
            </tr>
            `;

        });

        html += `</table>`;

        document.getElementById('taxes').innerHTML =
            html;

    }
    catch(err) {

        alert("Ошибка загрузки данных");

        console.log(err);

    }

}