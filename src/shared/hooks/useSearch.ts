import { isCompanyCardItem } from "./../constants/card";
/**
 * Set of hooks for handling search with pagination.
 * These hooks are agnostic to the actual querying of results,
 * so you could be fetching results from an API, searching a
 * predefined list, etc, and it doesn't matter; the hooks
 * only deal with updating the state of the search and transforming
 * returned data from whatever fetched data you fetch.
 */
import { useState, useCallback, useEffect, useMemo } from "react";
import { DocumentNode } from "graphql";
import { QueryHookOptions, useLazyQuery, useQuery } from "@apollo/client";

import { useSearchParams } from "src/shared/hooks/useSearchParams";
import { LOCATION_MAP } from "src/shared/hooks/useSearchLocationFilter";

import { RESULTS_PER_PAGE, SearchType } from "src/shared/constants/search";
import {
  IGenericCardItem,
  isJobCardItem,
  isReviewJobCardItem,
  isReviewUserCardItem,
} from "src/shared/constants/card";
import { analytics } from "src/shared/utils/analytics";
import { slugify } from "src/shared/utils/misc";

/*******************************************************************
 *                             **Types**                           *
 *******************************************************************/
interface ListableData {
  [type: string]: {
    count: number;
    items: any[];
    lastCursor: string;
  };
}

export enum SearchState {
  INITIAL,
  LOADING,
  ERROR,
  RESULTS,
  NO_RESULTS,
  NO_MORE_RESULTS,
}

/*******************************************************************
 *                  **Utility functions/constants**                *
 *******************************************************************/
const searchTypeToDataName = {
  [SearchType.COMPANIES]: "companies",
  [SearchType.JOBS]: "jobs",
  [SearchType.REVIEWS]: "reviews",
};

const useSearchInputVariables = () => {
  const { searchSalaryFilter, searchRatingFilter, searchType } =
    useSearchParams();

  switch (searchType) {
    case SearchType.COMPANIES:
      return searchRatingFilter
        ? {
            filterOverallRatingGt: searchRatingFilter[0],
            filterOverallRatingLt: searchRatingFilter[1],
          }
        : {};
    case SearchType.JOBS:
      return {
        ...(searchRatingFilter
          ? {
              filterOverallRatingGt: searchRatingFilter[0],
              filterOverallRatingLt: searchRatingFilter[1],
            }
          : {}),
        ...(searchSalaryFilter
          ? {
              filterSalaryHourlyAmountGt: searchSalaryFilter[0],
              filterSalaryHourlyAmountLt: searchSalaryFilter[1],
            }
          : {}),
      };
    case SearchType.REVIEWS:
      return {
        ...(searchRatingFilter
          ? {
              filterOverallRatingGt: searchRatingFilter[0],
              filterOverallRatingLt: searchRatingFilter[1],
            }
          : {}),
        ...(searchSalaryFilter
          ? {
              filterSalaryAmountGt: searchSalaryFilter[0],
              filterSalaryAmountLt: searchSalaryFilter[1],
            }
          : {}),
      };
    default:
      throw new Error("Type not specified for search");
  }
};

/*******************************************************************
 *                              **Hook**                           *
 *******************************************************************/
export const useSearch = <GetSearchData>(
  query: DocumentNode,
  options: QueryHookOptions<GetSearchData>,
  transformData: (data?: GetSearchData) => IGenericCardItem[]
) => {
  const { searchQuery, searchSort, searchType } = useSearchParams();
  const searchInputVariables = useSearchInputVariables();
  const searchTypeName = searchTypeToDataName[searchType];

  const { loading, error, data, fetchMore, refetch } = useQuery<GetSearchData>(
    query,
    {
      ...options,
      variables: {
        search: {
          query: searchQuery,
          sort: searchSort,
          ...searchInputVariables,
        },
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const triggerSearchNextBatch = () => {
    fetchMore({
      variables: {
        search: {
          query: searchQuery,
          sort: searchSort,
          ...searchInputVariables,
        },
        after: (data as any)?.[searchTypeName].lastCursor,
      },
      updateQuery: (prev: any, { fetchMoreResult }: { fetchMoreResult: any }) =>
        ({
          [searchTypeName]: {
            count:
              prev[searchTypeName].count +
              fetchMoreResult[searchTypeName].count,
            items: [
              ...prev[searchTypeName].items,
              ...fetchMoreResult[searchTypeName].items,
            ],
            lastCursor: fetchMoreResult[searchTypeName].lastCursor,
            hasMore: fetchMoreResult[searchTypeName].hasMore,
          },
        }),
    });
  };

  const triggerSearchNew = () => {
    refetch({
      variables: {
        search: {
          query: searchQuery,
          sort: searchSort,
          ...searchInputVariables,
        },
      },
    });
  };

  const searchState = useMemo(() => {
    if (error) {
      return SearchState.ERROR;
    }
    if (loading) {
      return SearchState.LOADING;
    }
    if (!data || !(data as any)[searchTypeName]?.items.length) {
      return SearchState.NO_RESULTS;
    }
    if (!(data as any)[searchTypeName].hasMore) {
      return SearchState.NO_MORE_RESULTS;
    }
    return SearchState.RESULTS;
  }, [data, error, loading, searchTypeName]);

  // const [page, setPage] = useState(1); // most recent page fetched for query
  // const [isNewSearch, setIsNewSearch] = useState(false); // whether a search is completely new or just another page of the current search
  // const [isEndOfResults, setIsEndOfResults] = useState(false); // whether there are more results or not
  // const [isDataLoaded, setIsDataLoaded] = useState(false); // whether data is loaded and ready

  // /**
  //  * *Perform the search* and grab loading/error state and the
  //  * data resulting from the search.
  //  */
  // const shouldSkipSearch = useMemo(
  //   // do not make an API call if search query is empty (on initial load)
  //   () => searchState === SearchState.RESULTS || options.skip,
  //   [options.skip, searchState]
  // );

  // /**
  //  * After new data is fetched, *build list of new results*.
  //  * Update other info accordingly.
  //  */
  // const [unfilteredResults, setUnfilteredResults] = useState<
  //   IGenericCardItem[]
  // >([]);
  // useEffect(() => {
  //   const resultsFetched = data !== undefined;

  //   if (resultsFetched) {
  //     const newResults = transformData(data);

  //     if (isNewSearch) {
  //       setUnfilteredResults(newResults);
  //     } else {
  //       if (newResults.length > 0) {
  //         setUnfilteredResults((prevResults) => [
  //           ...prevResults,
  //           ...newResults,
  //         ]);
  //       }
  //     }

  //     // check whether or not there are more results to be fetched, so we can display
  //     // no more results as well as prevent further API calls with the same query.
  //     if (newResults.length < RESULTS_PER_PAGE) {
  //       setIsEndOfResults(true);
  //     } else {
  //       setIsEndOfResults(false);
  //     }

  //     // indicate that the data is ready for display
  //     setIsDataLoaded(true);
  //   }
  // }, [
  //   data,
  //   isNewSearch,
  //   setIsDataLoaded,
  //   setIsEndOfResults,
  //   setUnfilteredResults,
  //   transformData,
  // ]);

  // /**
  //  * Create *callbacks for triggering search*.
  //  */
  // const triggerSearchNew = useCallback(
  //   (newVal?: string, force?: boolean) => {
  //     if (force || (newVal !== undefined && newVal !== searchQuery)) {
  //       analytics.event({
  //         category: "Search",
  //         action: "Started new search",
  //         label: newVal,
  //       });

  //       setPage(1); // reset pagination
  //       setIsNewSearch(true);

  //       // indicate that a search has started
  //       setIsDataLoaded(false);

  //       // perform the new search
  //       setSearchQuery(newVal || searchQuery);
  //     }
  //   },
  //   [searchQuery, setSearchQuery]
  // );

  // const triggerSearchNextBatch = useCallback(() => {
  //   analytics.event({
  //     category: "Search",
  //     action: "Loaded more search results",
  //   });

  //   // increment page since we fetched a page
  //   setPage((prevPage) => prevPage + 1);
  //   setIsNewSearch(false);

  //   // indicate that a search has started
  //   setIsDataLoaded(false);
  // }, []);

  // /**
  //  * *Get new results if sort has changed.*
  //  */
  // const searchResults = useMemo(() => {
  //   let results: IGenericCardItem[] = unfilteredResults;
  //   if (searchLocationFilter) {
  //     results = results.filter((item) => {
  //       if (isCompanyCardItem(item)) {
  //         return searchLocationFilter.some((filterLoc) =>
  //           item.jobLocations.some((jobLoc) => slugify(jobLoc) === filterLoc)
  //         );
  //       } else if (isJobCardItem(item)) {
  //         return searchLocationFilter.includes(slugify(item.location));
  //       } else if (isReviewJobCardItem(item) || isReviewUserCardItem(item)) {
  //         return searchLocationFilter.includes(slugify(item.jobLocation));
  //       }
  //       return true;
  //     });
  //   }

  //   return results;
  // }, [searchLocationFilter, unfilteredResults]);

  // /**
  //  * *Track the state of searching*.
  //  */
  // useEffect(() => {
  //   let newState = SearchState.INITIAL;

  //   if (error) newState = SearchState.ERROR;
  //   else if ((searchResults.length === 0 || isNewSearch) && loading)
  //     newState = SearchState.LOADING;
  //   else if (searchResults.length === 0 && searchQuery !== undefined)
  //     newState = SearchState.NO_RESULTS;
  //   else if (searchResults.length > 0 && (!isDataLoaded || loading))
  //     newState = SearchState.RESULTS_LOADING;
  //   else if (isEndOfResults) newState = SearchState.NO_MORE_RESULTS;
  //   else if (searchResults.length > 0) newState = SearchState.RESULTS;

  //   setSearchState(newState);
  // }, [
  //   error,
  //   isDataLoaded,
  //   isEndOfResults,
  //   isNewSearch,
  //   loading,
  //   searchQuery,
  //   searchResults.length,
  //   setSearchState,
  // ]);


  return {
    searchState,
    searchResults: transformData(data),

    triggerSearchNew,
    triggerSearchNextBatch,
  };
};
