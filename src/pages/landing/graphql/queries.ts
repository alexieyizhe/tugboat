import { gql } from "@apollo/client";

export const getCompaniesReviewsLandingQuery = gql`
  query GetCompaniesReviewsLanding {
    companiesLanding(limit: 5) {
      items {
        id
        name
        description
        scoreAverages {
          overall
        }
        reviews {
          count
        }
      }
    }

    reviewsLanding(limit: 5) {
      items {
        id
        body
        isLegacy
        createdAt
        company {
          name
        }
        job {
          name
        }
        score {
          overall
        }
        tags
      }
    }
  }
`;
