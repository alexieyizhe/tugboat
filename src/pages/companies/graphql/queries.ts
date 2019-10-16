import { gql } from "apollo-boost";
import { jobResultFragment } from "src/api/fragments";

export const GET_COMPANY_DETAILS = gql`
  query GetCompanyDetails($slug: String) {
    company(slug: $slug) {
      name
      desc
      logoSrc
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
