import { gql } from "apollo-boost";
import { jobResultFragment } from "src/api/fragments";

export const GET_COMPANY_DETAILS = gql`
  query GetCompanyDetails($slug: String) {
    company(slug: $slug) {
      name
      desc
      logoSrc
      logoColor
      jobs {
        items {
          ...JobResult
        }
      }
      reviews {
        count
      }
      avgRating
    }
  }

  ${jobResultFragment}
`;

export const GET_COMPANY_JOBS = gql`
  query GetCompanyJobs(
    $slug: String
    $query: String
    $offset: Int
    $limit: Int
  ) {
    company(slug: $slug) {
      jobs(
        filter: {
          OR: [
            { name: { contains: $query } }
            { location: { contains: $query } }
          ]
        }
        sort: { name: DESC }
        skip: $offset
        first: $limit
      ) {
        items {
          ...JobResult
        }
      }
    }
  }

  ${jobResultFragment}
`;
