new Vue({
    el: '#app',
    data: {
        user: {
            email: '',
            password: '',
        },
        token: '',
        expired: '',
        apiPath: 'https://course-ec-api.hexschool.io',
        uuid: '87c11b32-8e80-4b1b-aaaa-2c44664c537e',
    },
    methods: {
        // 登入
        signin() {
            console.log(this.user);
            // POST api/auth/login
            const vm = this;

            const url = `${vm.apiPath}/api/auth/login`;

            axios.post(url, vm.user)
                .then(function (res) {
                    console.log(res.data.message);
                    vm.token = res.data.token;
                    vm.expired = res.data.expired;

                    document.cookie = `myToken=${vm.token}; expires=${new Date(vm.expired * 1000)};`;

                    location.href="product.html"
                })
                .catch(function (err) {
                    console.log(err);
                })
        }
    }
});