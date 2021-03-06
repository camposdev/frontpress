var module = angular.module("frontpress.views.home");

function HomeDirectiveController($stateParams, ListPostsModel, $state, $FrontPress, BlogApi, PageHeadModel, $location, PaginationModel, ApiManager){
    var vc = this;
    vc.vm = ListPostsModel;
    var firstNextPageNumber = 2;
    vc.loadMorePostsAndPaginate = loadMorePostsAndPaginate;
    PageHeadModel.init();

    var params = {
        pageSize: $FrontPress.pageSize,
        pageNumber: $stateParams.pageNumber ? $stateParams.pageNumber : 1
    };

    var blogInformationPromise = BlogApi.getBlogInformation();
    var loadPostsPromise = vc.vm.loadPosts(params);

    loadPostsPromise.then(function(loadedPosts){
        var totalPagesNumber = ListPostsModel.totalPostsNumber / $FrontPress.pageSize;
        PaginationModel.setLastPageNumber(totalPagesNumber);
        _setPaginationPages(params.pageNumber);
        if($FrontPress.apiVersion === "v2"){
            vc.vm.loadExternalFeaturedImages(loadedPosts);
        }
    });

    function _setPageMetaData(){
        blogInformationPromise.success(function(result){            

            PageHeadModel.setPageDescription(result.description);
            var siteName;

            if((!angular.isUndefined($FrontPress.overrides) && !angular.isUndefined($FrontPress.overrides.siteName))){
                siteName = $FrontPress.overrides.siteName;
            } else {
                siteName = ApiManager.getPath(result, "siteName");
            }

            var homeReplaceRules = {
                ":siteName": siteName
            };

            PageHeadModel.parsePageTitle("home", homeReplaceRules);

            var canonical = $location.absUrl().replace(/\/page\/[0-9]{1,}\/?/, "");

            PageHeadModel.setPageCanonical(canonical);
        });
    }

    _setPageMetaData();

    function loadMorePostsAndPaginate(){
        params.pageNumber++;
        var nextPageNumber = params.pageNumber ? params.pageNumber : firstNextPageNumber;
        var paginationOptions = {notify: false};
        var loadPostsPromise = vc.vm.loadPosts(params);


        loadPostsPromise.then(function(loadedPosts){
            if($FrontPress.apiVersion === "v2"){
                vc.vm.loadExternalFeaturedImages(loadedPosts);
            }
        });

        _setPageMetaData();
        _setPaginationPages(params.pageNumber);
        $state.go("home-pagination", {pageNumber: nextPageNumber}, paginationOptions);
    }

    function _setPaginationPages(currentPageNumber){
        PaginationModel.generatePaginationFromCurrentPageNumber(currentPageNumber);
    }
}

module.controller("HomeDirectiveController", HomeDirectiveController);
