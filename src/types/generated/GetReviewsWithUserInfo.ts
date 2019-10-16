/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetReviewsWithUserInfo
// ====================================================

export interface GetReviewsWithUserInfo_reviewsList_items {
  __typename: "Review";
  id: string | null;
  /**
   * Overall score of the job in a review.
   */
  overallRating: number | null;
  /**
   * Contents of a review.
   */
  body: string | null;
  /**
   * Tags to provide additional information for a review. Represented by a single string, with "," as delimiters between tags.
   */
  tags: string | null;
  author: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GetReviewsWithUserInfo_reviewsList {
  __typename: "ReviewListResponse";
  /**
   * List items
   */
  items: GetReviewsWithUserInfo_reviewsList_items[];
}

export interface GetReviewsWithUserInfo {
  reviewsList: GetReviewsWithUserInfo_reviewsList;
}
