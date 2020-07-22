// console.log('test');

var apiPath = 'https://course-ec-api.hexschool.io';
var uuid = '87c11b32-8e80-4b1b-aaaa-2c44664c537e';

Vue.component('page-component',{
    props: ['pages'],
    template: `
    <nav aria-label="Page navigation example">
        <ul class="pagination">
            <li class="page-item">
                <a class="page-link" href="#" aria-label="Previous" @click.prevent="changePageEvent(pages.current_page - 1)">
                <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
            <li v-for="(page, index) in pages.total_pages" :key="index" class="page-item">
                <a class="page-link" href="#">{{ page }}</a>
            </li>

            <li class="page-item">
                <a class="page-link" href="#" aria-label="Next" @click.prevent="changePageEvent(pages.current_page + 1)">
                <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        </ul>
    </nav>
    `,
    methods: {
        changePageEvent: function(page){
            this.$emit('changepage');
            console.log(page);
            
        }
    }
});

var app = new Vue({
    el: '#app',
    data: {
        products: [],
        copyProduct: {
            imageUrl: [],
        },
        pagination: {},
        token: '',
        filePath: '',
    },
    created() {
        const vm = this;
        // 取得 token 的 cookies（注意取得的時間點）
        // 詳情請見：https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie
        vm.token = document.cookie.replace(/(?:(?:^|.*;\s*)myToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        if(vm.token === ''){
            // 取不到 token，返回登入畫面
            window.location = 'index.html'; 
        }else{
            // 取到 token 初始代入資料
            vm.getProduct();
        }
    },
    methods: {
        // 決定需要開的 modal
        openModal(isNew, item) {
            switch (isNew) {
                case 'new':
                    this.copyProduct = {
                        imageUrl: [],
                    };
                    $('#productModal').modal('show');
                    break;
                case 'update':
                    this.copyProduct = Object.assign({}, item);
                    $('#productModal').modal('show');
                    break;
                case 'delete':
                    $('#delProductModal').modal('show');
                    this.copyProduct = Object.assign({}, item);
                    break;
            }
        },
        // 更新品項
        updateProduct() {
            const vm = this;
            // 判斷當前品項是否已經存在
            if (vm.copyProduct.id) {
                // 若有存在，則找出在 products 陣列內的位置
                vm.products.forEach(function (item, i) {
                    if (item.id === vm.copyProduct.id) {
                        vm.products[i] = vm.copyProduct;
                    }
                });

                // token 處理
                axios.defaults.headers.common['Authorization'] = `Bearer ${ vm.token }`;

                // api url , id 使用 copyProduct 的 id
                const url = `${apiPath}/api/${uuid}/admin/ec/product/${vm.copyProduct.id}`; 

                // 使用 patch 更新產品資訊
                axios.patch(url, vm.copyProduct)
                    .then(function(response){
                        console.log(response);
                    })

            } else {
                // 若沒有存在，則給它一個新的 id 並 push 到 products 內
                vm.copyProduct.id = new Date().getTime();

                // token 處理
                axios.defaults.headers.common['Authorization'] = `Bearer ${ vm.token }`;

                // api url
                const url = `${apiPath}/api/${uuid}/admin/ec/product`;

                // 使用 post 方法新增品項
                axios.post(url, vm.copyProduct)
                    .then(function(res){
                        console.log(res);
                    })
                
                // push 到 products 內
                vm.products.push(vm.copyProduct);
            }

            // 清空 copyProduct
            vm.copyProduct = {
                imageUrl: [],
            };

            // modal 關掉
            $('#productModal').modal('hide');
        },
        // 刪除品項
        delProduct() {
            const vm = this;

            // 找出要刪除的品項在 products 陣列內的索引位置
            let key = '';
            vm.products.forEach(function (item, index) {
                if (vm.copyProduct.id === item.id) {
                    key = index;
                }
            });

            // token 處理
            axios.defaults.headers.common['Authorization'] = `Bearer ${ vm.token }`;

            // api url , id 使用 copyProduct 的 id
            const url = `${apiPath}/api/${uuid}/admin/ec/product/${vm.copyProduct.id}`;
            
            axios.delete(url)
                .then(function(res){
                    console.log(res)
                })
            
            // products 陣列內刪除
            vm.products.splice(key, 1);

            // 清空 copyProduct
            vm.copyProduct = {
                imageUrl: [],
            };

            // modal 關掉
            $('#delProductModal').modal('hide');
        },
        // 取得資料
        getProduct(page = 1) {
            const vm = this;

            // api 路徑
            const url = `${apiPath}/api/${uuid}/admin/ec/products?page=${page}`;

            // token 處理
            axios.defaults.headers.common['Authorization'] = `Bearer ${ vm.token }`;

            // 連接 api
            axios.get(url)
                .then(function(response){
                    // 把 api 的 pagination 的資料帶回來
                    vm.pagination = response.data.meta.pagination
                    // 把所有產品撈取回來
                    vm.products = response.data.data;
                })
            
        },
        // 登出
        signout() {
            document.cookie = `myToken=; expires=;`;
            location.href="login.html"
        },
        // 圖片上傳測試
        uploadFile() {
            const vm = this;
            
            // api 路徑
            const url = `${apiPath}/api/${uuid}/admin/storage`;
            
            // 取得 DOM 元素
            const fileImg = document.querySelector('#file').files[0];
            // console.dir(file);

            // 轉成 formData
            const formData = new FormData();
            formData.append('file', fileImg);

            // token 處理
            axios.defaults.headers.common['Authorization'] = `Bearer ${ vm.token }`;

            // ajax 處理，使用 post，並宣告使用 formData 格式
            axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
                .then(function(res){
                    console.log(res)
                    vm.filePath = res.data.data.path;
                })
        }
    }
});
// title：商品名稱 - string
// category：商品分類 - string
// content：商品敘述 - string
// description：商品說明 - string
// imageUrl：商品圖片 - string
// enabled：是否上架 - boolean
// origin_price：原價 - number(integer)
// price：售價 - number(integer)
// unit：單位 - string

