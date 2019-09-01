(() => {
    Vue.component('image-model', {
        //data, method, mounted
        template: '#image-model-templete',
        data:function(){
            return{
                imageData:[],
                commentsInfo: [],
                commentUsername: "",
                comment: ""
            };
        },
        props: ['id'],
        mounted: function(){
            console.log('Component is mounted...');
            console.log('this is this components Id: ', this.id);
            var me = this;
            axios
                .get('/getImagesFromId/' + this.id)
                .then( function(res){
                    console.log("getPicturesFromId:", res.data);
                    me.imageData = res.data[0];
                    me.commentsInfo = res.data;
                    console.log('imageData ID: ', me.imageData.id);
                    console.log('imageData: ', me.imageData);

                }).catch(function(err){
                    console.log('/getPicturesFromId axios error: ', err);
                });
        },
        //methods only run when a user does something (click, )
        methods: {
            myClick: function(){
                console.log('myClick running!');
            },
            closeModal: function(){
                console.log('closeModal is runnig!!!');
                this.$emit('close-modal');
            },
            sendComment: function(e){
                console.log('comment is sending!');
                e.preventDefault();
                var me = this;
                console.log('sendComment username: ', this.commentUsername);
                console.log('sendComment comment: ', this.comment);
                console.log('sendComment id: ', this.id);
                var data = {
                    id: this.id,
                    username: this.commentUsername,
                    comment: this.comment
                };
                axios
                    .post('/add-comment', data)
                    .then(function(res) {
                        console.log('/add-comment, data: ', res.data);
                        me.commentsInfo.unshift(res.data.rows[0]);
                        me.commentUsername = "";
                        me.comment = "";
                    }).catch(function(err){
                        console.log('/add-comment axios error: ', err);
                    });
            }
        }
    });

    new Vue({
        el: '#main',
        data: {
            id:'',
            showModal: false,
            images:[],
            title:'',
            description:'',
            username:'',
            file: null,
        },
        mounted: function(){
            console.log('My Vue Instance is mounted.');
            console.log('My images are: ', this.images);
            var me = this;
            axios
                .get('/getImages')
                .then(function(res){
                    console.log('me.images: ', me.images);
                    console.log('This is my response: ', res.data);
                    me.images = res.data;
                }).catch(function(err) {
                    console.log("/getImages axios Error:", err);
                });
        },
        methods:{
            handleUpload: function(e){
                e.preventDefault();
                console.log('this: ', this);
                var me = this;
                var formData = new FormData();
                formData.append('title', this.title);
                formData.append('description', this.description);
                formData.append('username', this.username);
                formData.append('file', this.file);
                console.log('formData: ', formData); //first it is an empty object

                axios
                    .post('/upload', formData)
                    .then(function(res){
                        console.log('res from post /upload: ', res.data);
                        me.images.unshift(res.data.rows[0]);
                    }).catch( function(err){
                        console.log('err in POST /upload. ', err);
                    });
            },
            handleChange: function(e){
                console.log('handleChange is running!!!');
                console.log('file: ', e.target.files[0]); //secilen dosya
                this.file = e.target.files[0];
            },
            showModalMethod: function (id){
                console.log('showModalMethod is running!!!');
                this.showModal = true;
                this.id = id;
                console.log('this.id: ', this.id);
            },
            closeModalOnParent: function(){
                console.log('closeModelOnParent running!!!');
                this.showModal = false;
                console.log('showModal: ', this.showModal);
            }
        }

    });
})();
