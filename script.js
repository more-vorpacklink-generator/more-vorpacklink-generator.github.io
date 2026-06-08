var loaded_data = {}
var selected_products = {}
var visible = true

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createUrl(){
    var url = "https://morenutrition.de"
    var local_url = new URL(window.location.href).pathname;
    item_id = 0
    for (variant in selected_products){
        item_id +=1
        if (item_id > 1){
            url = url + "," + variant + ":" + selected_products[variant]
            local_url = local_url + "," + variant + ":" + selected_products[variant]
        }
        else{
            url = url + "/cart/" + variant + ":" + selected_products[variant]
            local_url = local_url + "?products=" + variant + ":" + selected_products[variant]
        }
    }
    var discount_input = document.getElementById("discount") 
    var dicount_code = discount_input.value.trim()
    url = url + "?storefront=true"
    if (dicount_code != ""){
        url = url + "&discount=" + dicount_code
        local_url = local_url + "&discount=" + dicount_code
    }
    history.replaceState("", "", local_url);
    return url
}

function deleteSelection(variant_id){
    var counter = document.getElementById("counter-" + variant_id)
    counter.value = 0
    updateSelection(variant_id)
}

function changeValue(variant_id, option){
    var amount = selected_products[variant_id]
    if (amount == undefined || amount == null || amount < 0){
        amount = 0
    }
    if (option == "-" && amount > 0){
        amount -= 1
    }
    else if (option == "+"){
        amount += 1
    }
    var counter = document.getElementById("counter-" + variant_id)
    counter.value = amount
    updateSelection(variant_id)
}

function updateTotalPrice(){
    var selection_info = document.getElementById("selection-info")
    var total_price = 0
    for (variant in selected_products){
        total_price += selected_products[variant] * loaded_data[variant].price
    }
    selection_info.innerHTML = "Deine Auswahl: " + Number.parseFloat(total_price).toFixed(2) + " €"
}

function updateSelection(variant_id){
    var checkout_href = document.getElementById("direct-checkout")
    var counter_element = document.getElementById("counter-"+variant_id)
    var selected_products_element = document.getElementById("selected-products-element")
    var amount = parseInt(counter_element.value)
    if (amount != NaN && amount > 0){
        selected_products[variant_id] = amount
    }
    else{
        amount = 0
    }
    
    var div = document.getElementById("selection-"+variant_id)
    if (amount <= 0){
        if (div != null){
            selected_products_element.removeChild(div)
        }
        
        delete selected_products[variant_id]
        var result = createUrl()
        document.getElementById("result-url").value = result
        checkout_href.href = result
        updateTotalPrice()
        return
    }
    updateTotalPrice()
    if (div == null){
        div = document.createElement("div")
        div.id = "selection-"+variant_id
        div.classList.add("selection")
        var delete_button = document.createElement("button")
        delete_button.id = "delete-" + variant_id
        delete_button.innerHTML = '<i class="fa-solid fa-x"></i>'
        delete_button.classList.add("delete-button")
        delete_button.setAttribute("onclick",`deleteSelection(${variant_id})`);
        var minus_button = document.createElement("button")
        minus_button.innerHTML = '<i class="fa-solid fa-minus"></i>'
        minus_button.classList.add("selected-minus-button")
        minus_button.id = "selected-minus-" + variant_id
        minus_button.setAttribute("onclick",`changeValue(${variant_id}, "-")`);
        var plus_button = document.createElement("button")
        plus_button.innerHTML = '<i class="fa-solid fa-plus"></i>'
        plus_button.classList.add("selected-plus-button")
        plus_button.id = "selected-plus-" + variant_id
        plus_button.setAttribute("onclick",`changeValue(${variant_id}, "+")`);

        var text = document.createElement("h4")
        var price = document.createElement("h4")
        var img = document.createElement("img")
        img.id = "selection-image-"+ variant_id
        img.classList.add("selection-image")
        img.loading = "lazy"
        text.id = "selection-title-"+ variant_id
        text.classList.add("selected-title")
        price.id = "selection-price-"+ variant_id
        price.classList.add("selected-price")
        div.appendChild(minus_button)
        div.appendChild(plus_button)
        div.appendChild(delete_button)
        div.appendChild(img)
        div.appendChild(price)
        div.appendChild(text)
        selected_products_element.appendChild(div)
    }
    else{
        var text = document.getElementById("selection-title-"+ variant_id)
        var price = document.getElementById("selection-price-"+ variant_id)
        var img = document.createElement("selection-image-"+ variant_id)
    }


    text.innerHTML = loaded_data[variant_id].product_title + " " + loaded_data[variant_id].variant_title
    price.innerHTML = Number.parseFloat(selected_products[variant_id] * loaded_data[variant_id].price).toFixed(2) + " € (" + amount + " x " + Number.parseFloat(loaded_data[variant_id].price).toFixed(2) + " €)"
    img.src = loaded_data[variant_id].image_url
    var result = createUrl()
    document.getElementById("result-url").value = result
    checkout_href.href = result
}

function createElements(){
    loader = document.getElementById("product-loader")
    loader.innerHTML = ""
    for (variant in loaded_data){
        var d = document.createElement("div")
        d.id = variant
        var full_title = loaded_data[variant].product_title + " " + loaded_data[variant].variant_title
        d.setAttribute('data-name', full_title)
        var price = document.createElement("h4")
        price.classList.add("product-text")
        var text = document.createElement("h3")
        text.classList.add("product-text")
        var text2 = document.createElement("h4")
        text2.classList.add("product-text")
        var a = document.createElement("a")
        var p = document.createElement("p")
        p.classList.add("line-breaker")
        text.innerHTML = loaded_data[variant].product_title
        if (loaded_data[variant].variant_title == "Default Title"){
            loaded_data[variant].variant_title = ""
        }
        text2.innerHTML = loaded_data[variant].variant_title
        d.classList.add("product-element")
        var img = document.createElement("img")
        img.id = "img-" + variant
        img.width = "200"
        img.height = "200"
        img.loading = "lazy"
        var minus_button = document.createElement("button")
        minus_button.innerHTML = '<i class="fa-solid fa-minus"></i>'
        minus_button.classList.add("minus-button")
        minus_button.classList.add("amount-change-button")
        minus_button.id = "minus-" + variant
        minus_button.setAttribute("onclick",`changeValue(${variant}, "-")`);
        var plus_button = document.createElement("button")
        plus_button.innerHTML = '<i class="fa-solid fa-plus"></i>'
        plus_button.classList.add("plus-button")
        plus_button.classList.add("amount-change-button")
        plus_button.id = "plus-" + variant
        plus_button.setAttribute("onclick",`changeValue(${variant}, "+")`);
        var counter = document.createElement("input")
        counter.id = "counter-" + variant
        counter.type = "number"
        counter.value = "0"
        counter.classList.add("counter")
        counter.setAttribute("onchange",`updateSelection(${variant})`);
        counter.pattern = "[0-9]"
        counter.min = "0"
        a.href = "https://morenutrition.de/products/" + loaded_data[variant].handle + "?variant=" + variant
        a.target = "_blank"
        img.src = loaded_data[variant].image_url
        price.innerHTML = loaded_data[variant].price + " €"
        a.appendChild(img)
        d.appendChild(a)
        d.appendChild(p)
        d.appendChild(minus_button)
        d.appendChild(counter)
        d.appendChild(plus_button)
        d.appendChild(price)
        d.appendChild(text)
        d.appendChild(text2)
        
        loader.appendChild(d)
        if (selected_products[variant] != null){
            counter.value = selected_products[variant]
            updateSelection(variant)
        }
    }
    var result = createUrl()
    document.getElementById("result-url").value = result
    document.getElementById("direct-checkout").href = result
}

function updateElements(search_value){
    var product_loader = document.getElementById("product-loader")
    for (product_element of product_loader.childNodes){
        var instance = new Mark(product_element);
        instance.unmark()
        if (search_value == "" || product_element.getAttribute("data-name").toLowerCase().includes(search_value.toString().toLowerCase().trim())){
            product_element.style.display = "inline-table"
            instance.mark(search_value)
            continue
        }
        product_element.style.display = "none"
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    var url_params = new URLSearchParams(document.location.search)
    var products_params = url_params.get("products")
    var search_input = document.getElementById("search")
    var discount_input = document.getElementById("discount") 
    var url_products = []
    if (products_params != null){
        url_products = products_params.split(",")
    }

    const products = await fetch("/products.json")
    products_data = await products.json()
    // const collections = await fetch("https://morenutrition.de/products.json?limit=9999")
    // collections_data = await collections.json()
    for (product of products_data.products){
        for (variant of product.variants){
            if (product.tags.includes("hidden")){
                continue
            }
            loaded_data[variant.id] = {}
            if (variant.featured_image != null){
                loaded_data[variant.id].image_url = variant.featured_image.src.replace("https://cdn.shopify.com/s/files/1/0503/7536/0676/files/", "https://morenutrition.de/cdn/shop/files/") + "&width=400"
            }
            else{
                loaded_data[variant.id].image_url = product.images[0].src.replace("https://cdn.shopify.com/s/files/1/0503/7536/0676/files/", "https://morenutrition.de/cdn/shop/files/") + "&width=400"
            }
            loaded_data[variant.id].product_title = product.title
            loaded_data[variant.id].variant_title = variant.title
            loaded_data[variant.id].price = variant.price
            loaded_data[variant.id].product_id = product.id
            loaded_data[variant.id].handle = product.handle
            loaded_data[variant.id].available = variant.available
        }
    }
    for (url_product of url_products){
        url_product_id = url_product.split(":")[0]
        url_product_amount = url_product.split(":")[1]
        if (url_product_id in loaded_data){
            selected_products[url_product_id] = url_product_amount
        }

    }
    
    var discount_params = url_params.get("discount")
    if (discount_params != null){
        discount_input.value = discount_params
    }
    createElements()

    search_input.addEventListener("keyup", function () {
        updateElements(search_input.value)
    })
    discount_input.addEventListener("keyup", function () {
        var result = createUrl()
        document.getElementById("result-url").value = result
        document.getElementById("direct-checkout").href = result
    })
    
    var copy_button = document.getElementById("copy-link")
    var result_url_field = document.getElementById("result-url")

    copy_button.addEventListener("click", async function () {
        result_url_field.focus();
        result_url_field.select();

        const range = document.createRange();
        range.selectNodeContents(result_url_field);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        result_url_field.setSelectionRange(0, result_url_field.value.length);
        result = document.execCommand('copy');
        window.getSelection().removeAllRanges();
        result_url_field.blur();

        copy_button.innerHTML = '<i class="fa-solid fa-check"></i></i> Kopiert!'
        var old_style = copy_button.style.border
        copy_button.style.border = "2px solid green"
        await sleep(1500)
        copy_button.innerHTML = '<i class="fa-solid fa-copy"></i> Kopieren'
        copy_button.style.border = old_style
        
    });

    var show_more_less = document.getElementById("show-more-less")
    var selected_products_ = document.getElementById("selected-products")
    var selected_products_container = document.getElementById("selected-products-container")
    show_more_less.addEventListener("click", async function () {
        if (visible === true){
            selected_products_.classList.add("hide")
            selected_products_container.classList.add("container150")
            show_more_less.innerHTML = '<i class="fa-solid fa-arrow-down"></i>'
            visible = false
        }
        else{
            selected_products_.classList.remove("hide")
            selected_products_container.classList.remove("container150")
            show_more_less.innerHTML = '<i class="fa-solid fa-arrow-up"></i>'
            visible = true
        }
    });
    
    
    document.addEventListener('keydown', function(event) {
        // console.log(event.keyCode);
        if (event.ctrlKey && (event.keyCode == 70 || event.keyCode == 71)) {
            event.preventDefault()
            search_input.focus()
        }
        else if (event.ctrlKey && event.keyCode == 68) {
            event.preventDefault()
            discount_input.focus()
        }
        else if (event.ctrlKey && (event.keyCode == 67)) {
            event.preventDefault()
            copy_button.click()
        }
        else if (event.keyCode == 27) {
            event.preventDefault()
            search_input.blur()
            discount_input.blur()
        }
    });
});