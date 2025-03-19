let goldenBridgeSection = document.querySelector("#citizen-section-1");

let sellers = goldenBridgeSection.querySelectorAll(".citizen-overflow-wrapper");

let sellerData = [];

function getData() {
    const sellerData = [];

    for (let seller of sellers) {
        const table = seller.querySelector("tbody");
        const sellerName = seller.querySelector("caption").innerText.slice(1, -7);
        
        const Lord = {
            name: sellerName,
            items: [],
        }

        const rows = Array.from(table.querySelectorAll("tr")).slice(2);
        for (let row of rows) {
            const imageContainer = row.querySelectorAll(".invslot");
            const image = imageContainer[0].querySelector("img");
            const imageSrc = image.getAttribute("src");
            const baseUrl = window.location.href;
            const imageUrl = new URL(imageSrc, baseUrl).href;
            const data = row.querySelectorAll("td")[1].innerText;
            const quantity = data.split("×")[0].trim();
            const name = data.split("×")[1].trim();

            Lord.items.push({
                name: name,
                quantity: quantity,
                imageUrl: imageUrl,
            });
        }

        sellerData.push(Lord);
    }

    return sellerData;
}

let data = getData();

JSON.stringify(data, null, 2);