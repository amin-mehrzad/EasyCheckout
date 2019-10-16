const getThemeComponents = async (ctx, accessToken, shop) => {
    const response = await fetch(`https://${shop}/admin/api/2019-07/themes.json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": accessToken,
        },
        // body: query
    })

    const responseJson = await response.json();
    console.log(responseJson.themes[0].id);
    var themeID;
    for (var key in responseJson.themes) {
        if (responseJson.themes[key].role == 'main') {
            themeID = responseJson.themes[key].id;
            break;
        }
    }
    console.log(themeID);

    const assetsResponse = await fetch(`https://${shop}/admin/api/${process.env.API_VERSION}/themes/${themeID}/assets.json?asset[key]=templates/cart.liquid&theme_id=${themeID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": accessToken,
        },
    });

    const assetsResponseJson = await assetsResponse.json();
    console.log(assetsResponseJson);
    cartValue = "{% include 'validage-popup-form' %}\n" + assetsResponseJson.asset.value;
    console.log(cartValue);

    const cartResponse = await fetch(`https://${shop}/admin/api/${process.env.API_VERSION}/themes/${themeID}/assets.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": accessToken
        },
        body: JSON.stringify({
            asset: {
                key: 'templates/cart.liquid',
                value: cartValue
            }
        })
    });
    const cartResponseJason = await cartResponse.json();
    console.log(cartResponseJason);


    const snippetResponse = await fetch(`https://${shop}/admin/api/${process.env.API_VERSION}/themes/${themeID}/assets.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": accessToken
        },
        body: JSON.stringify({
            asset: {
                key: 'snippets/validage-popup-form.liquid',
               value: "<div id='myModal' class='modal'><div class='modal-content'><span class='close'>&times;</span><p>Some text in the Modal..</p></div></div><script>var modal = document.getElementById('myModal');var btn = document.getElementsByName('checkout');var span = document.getElementsByClassName('close')[0];btn.onclick = function() {modal.style.display = 'block';}span.onclick = function() {modal.style.display = 'none';}window.onclick = function(event) { if (event.target == modal) {modal.style.display = 'none';}}</script>"
                //src: ''
            }
        })
    });
    const snippetResponseJason = await snippetResponse.json();
    console.log(snippetResponseJason);
    return
};

module.exports = getThemeComponents;