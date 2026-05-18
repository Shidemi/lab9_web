async function loadItems() {

    try {

        const response =
            await fetch('/items');

        const items =
            await response.json();

        const list =
            document.getElementById('list');

        list.innerHTML = '';

        items.forEach(item => {

            list.innerHTML += `
            <div class="tax-card">

                <h3>${item.name}</h3>

                <p>
                    ${item.description}
                </p>

                <p>
                    Ставка:
                    ${item.rate}
                </p>

                <button
                onclick="deleteItem(${item.id})">

                    Удалить

                </button>

            </div>
            `;

        });

    } catch (e) {

        console.log(e);

        alert(
            'Ошибка загрузки данных'
        );

    }

}

async function deleteItem(id) {

    await fetch(`/items/${id}`, {

        method: 'DELETE'

    });

    loadItems();

}

window.onload = loadItems;