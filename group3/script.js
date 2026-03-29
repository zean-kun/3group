class NewsApp{
    constructor(){
        this.API_KEY = "08be4e86e8674dddbdd30e79d6edf0ad";

        this.BASE_URL = "https://newsapi.org/v2";

        this.state = {
            category:"general",
            page:1,
            loading:false,
            query:'',
            articles:[],
            totalResults:Infinity
        }

        this.int()
    }

    int(){
        this.setupEvents();
        this.loadNews();
    }
        setupEvents(){

            document.querySelectorAll(".category-btn").forEach(
                btn=>{
                    btn.onclick = ()=> this.changeCategory(btn.dataset.category);
                })
            

                document.getElementById("searchBox").addEventListener('input',(e)=>{
                    this.search(e.target.value);
                })

                window.onscroll = () => {
                    const { scrollTop,scrollHeight,clientHeight} = document.documentElement
                    if(scrollTop + clientHeight >= scrollHeight - 1000 && !this.state.loading){
                        if(this.state.articles.length < this.state.totalResults){
                            this.loadMore();
                        }else{
                            this.showEndMessage();
                        }
                    }
                }


                document.onclick=(e)=>{
                    const card = e.target.closest(".news-card");
                    if(card?.dataset.url){
                        window.open(card.dataset.url,"_blank")
                    }
                }
        }


        changeCategory(category){
            if(category === this.state.category) return;

            document.querySelectorAll(".category-btn").forEach(btn=>
                btn.classList.remove("active")
            );
            document.querySelector(`[data-category="${category}]`).
            classList.add("active");

            this.resetState({category,query:""});
            document.getElementById("searchInput").value="";

            this.loadNews();
            
        }

        search(query){
            this.resetState({query});
            this.loadNews();
        }

        async loadNews() {
            if(this.state.loading) return;

            this.hideEndMessage();
            this.toggleLoading(true);

            try {
                const url =this.buildUrl();

                const response = await fetch(url);

                const data = await response.json();

                if(data.status === "ok" && data.articles.length >0){
                    this.state.articles = data.totalResults;

                    this.state.totalResults = data.totalResults;

                    this.renderNews(data.articles);

                    this.hideError();

                } else{
                    this.showError(data.message || "No news found.")

                }
            } catch (error) {
                this.showError("faild to fetch news. please check your connection")
            }

            this.toggleLoading(false);
        }

        resetState(updates){

            this.state = {
                ...this.state,
                ...updates,
                page: 1,
                articles :[],
                totalResults:Infinity,
                loading:false
            };

            document.getElementById("newsGrid").innerHTML = '';
            this.hideEndMessage();
        }

        async loadMore(){
            if(this.state.articles.length >= this.state.totalResults){
                this.showEndMessage();
                window.scroll = null;
                this.toggleLoading(false);
                return
            }
            this.state.page++;
            this.toggleLoading(true)
            
            try {
                const url = this.buildUrl();
                const resonse = await fetch(url);
                const data = await response.json();

                if(data.status == "ok" && data.articles.length > 0){
                    this.state.articles.push(...data.article);
                    this.renderNews(data.articles, true)

                    if (this.state.articles.length >= this.state.totalResults){
                        this.showEndMessage();
                        window.onscroll=null;
                    }
                }else{
                    this.showEndMessage();
                    window.onscroll=null;
                }


            } catch (error) {
                console.error(error);
                this.state.page--;
            }

            this.toggleLoading(false);
        }

        buildUrl(){
            const params = new URLSearchParams({
                apikey: this.API_KEY,
                page:this.state.page,
                pageSize:20,
                country:"us",
                category:this.state.category
            });

            if(this.state.query) params.append("q",this.state.query);

            return `${this.BASE_URL}/top-headlines?${params}`
        }

        renderNews(articles,append=false){
            const grid = document.getElementById("neGridws");
            if(!append) grid.innerHTML = '';

            articles.forEach(article =>{
                const card = document.createElement("div");
                card.className= "news-card";
                card.dataset.url = article.url;

                const img = article.urlToImage ? `img src=${article.urlToImage}" alt=
                ${article.title}" class="news-image"onerror="this.outerHTML='<div class=\\'news-image
                default-image\\'YOUR NEWS</div'">`:'<div class="news-image defaul-image">YOUR NEWS</div>';

                card.innerHTML=`
                ${img}
                <div class="news-content">
                <h3 class"news-title">${article.title}</h3>
                <p class="news-description">${article.description || 
                'No description available.'}</p>
                <div class"news-meta">
                    <span class="news-source">${article.source.name}</span>
                    <span class"news-date">${new Date(article.publishedAt).toLocaleDateString("en-US",{
                        month:"short",
                        day:"numeric",
                        year:"numeric"
                    })}</span>
                    </div>
                    </div>
                    `;
                    grid.appendChild(card)
            })
        }

        showError(msg){
            const error = document.getElementById("error");
            error.textContent = msg;
            error.style.display = "block";
        }
        hideError(){
            document.getElementById("error").style.display = "none";
        }

        showEndMessage(){
            document.getElementById("endMessage").style.display= "block";
        }

        hideEndMessage(){
            document.getElementById("endMessage").style.display= "none";
        }



        toggleLoading(show){
            this.state.loading = show;
            document.getElementById("loading").style.display = show?
            "block":"none";
        }
    
}

document.addEventListener("DOMContentLoaded",()=> new NewsApp())