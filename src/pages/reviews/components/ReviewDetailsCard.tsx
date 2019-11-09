/* eslint-disable no-restricted-globals */
// TODO: upgrade to cra with optional chaining support and remove this stuff
import React from "react";
import styled from "styled-components";
import classNames from "classnames";

import { Size } from "src/theme/constants";
import { RouteName } from "src/shared/constants/routing";
import { getDarkColor } from "src/shared/utils/color";

import {
  IDetailsCardProps,
  DetailsCard as BaseDetailsCard,
  MOBILE_MENU_MEDIA_QUERY,
  Link,
  Text,
  StarRating,
  UnstyledButton,
  Icon,
  IconName,
} from "src/components";

/*******************************************************************
 *                            **Types**                           *
 *******************************************************************/
export interface IReviewDetails {
  jobName: string;
  jobId: string;
  companyName: string;
  companySlug: string;
  location?: string;
  author: string;
  body: string;
  overallRating: number;
  meaningfulWorkRating: number;
  workLifeBalanceRating: number;
  learningMentorshipRating: number;
  salary: number;
  salaryCurrency: string;
  salaryPeriod: string;
  logoSrc: string;
  color: string;
  date: string;
  relativeDate: string;
}

export interface IReviewDetailsCardProps extends IDetailsCardProps {
  onExit: (e: React.MouseEvent) => void;
  reviewDetails?: IReviewDetails;
}

/*******************************************************************
 *                  **Utility functions/constants**                *
 *******************************************************************/
/**
 * Converts the stored backend value into a readable
 * format for display.
 * The reason we use hourly/monthly/weekly is from legacy
 * internCompass data.
 * @param salaryPeriod one of `weekly`, `hourly`, `monthly`
 */
const getSalaryPeriodText = (salaryPeriod?: string) => {
  switch (salaryPeriod) {
    case "monthly":
      return "/month";
    case "weekly":
      return "/week";
    case "hourly":
      return "/hr";
    default:
      return "";
  }
};

/*******************************************************************
 *                            **Styles**                           *
 *******************************************************************/
const DetailsCard = styled(BaseDetailsCard)`
  max-width: 700px;
  margin: auto;

  ${({ theme }) => theme.mediaQueries.medium`
    max-width: 80%;
  `}

  ${({ theme }) => theme.mediaQueries.tablet`
    padding: ${theme.padding.displayMobile};
    
    & h1 {
      font-size: ${theme.fontSize[Size.LARGE]}px;
    }

    & .misc-info {
      flex-direction: column;
    }
  `}

  ${({ theme }) => theme.mediaQueries.xlMobile`
    top: 5%;
    max-width: 90%;
  `}

  ${({ theme }) => theme.mediaQueries[MOBILE_MENU_MEDIA_QUERY]`
    width: 100%;
    left: 0;
    border-radius: ${theme.borderRadius.button}px;
  `}
`;

const FlexRowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const LogoImg = styled.img`
  margin-left: 20px;
  max-width: 80px;
`;

const ReviewRating = styled(StarRating)`
  display: flex;
  justify-content: flex-start;

  & > .rating-text {
    padding: 0 3px;
  }
`;

const SalaryInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  ${({ theme }) => theme.mediaQueries.tablet`
    flex-direction: row;
    margin-top: 10px;
    
    & > * {
      font-size: ${theme.fontSize[Size.SMALL]}px;

      &:first-child::after {
        white-space: pre;
        content: " ";
      }
    }
  `}
`;

const ReviewPrefixContainer = styled.div`
  margin: 50px auto 10px 0;
`;

const ReviewBody = styled(Text)`
  display: inline-block;
  margin-top: 20px;
`;

const CloseButton = styled(UnstyledButton)`
  position: absolute;
  width: 25px;
  height: 25px;
  top: -10px;
  right: -10px;

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1;
  cursor: pointer;

  & .bg {
    z-index: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.color.error};
    border-radius: 50%;
  }

  &:hover > .bg,
  &:focus > .bg {
    transition: transform 150ms ease-out;
    transform: scale(1.1);
  }

  & > svg {
    z-index: 1;
  }
`;

/*******************************************************************
 *                           **Component**                         *
 *******************************************************************/
const ReviewDetailsCard: React.FC<IReviewDetailsCardProps> = ({
  className,
  onExit,
  reviewDetails,
  ...rest
}) => (
  <DetailsCard
    className={classNames("company", className)}
    color="greyLight"
    {...rest}
  >
    <div>
      <FlexRowContainer>
        <div>
          <Link to={`${RouteName.JOBS}/${reviewDetails?.jobId}`} bare>
            <Text variant="heading1" as="h1">
              {reviewDetails?.jobName}
            </Text>
          </Link>
          <Link
            to={`${RouteName.COMPANIES}/${reviewDetails?.companySlug}`}
            bare
          >
            <Text variant="heading3" color={getDarkColor(reviewDetails?.color)}>
              {reviewDetails?.companyName}
            </Text>
          </Link>
          {reviewDetails?.location && (
            <Text
              className="subheading location"
              variant="heading3"
              color="greyDark"
            >
              {` • ${reviewDetails?.location}`}
            </Text>
          )}
        </div>
        <Link to={`${RouteName.COMPANIES}/${reviewDetails?.companySlug}`} bare>
          <LogoImg
            src={reviewDetails?.logoSrc}
            alt={`Logo of ${reviewDetails?.companyName}`}
          />
        </Link>
      </FlexRowContainer>

      <ReviewPrefixContainer>
        <Text variant="subheading">{reviewDetails?.author} </Text>
        <Text variant="subheading" color="greyDark">
          mentioned the following{" "}
        </Text>
        <Text variant="subheading" title={reviewDetails?.date}>
          {reviewDetails?.relativeDate}...
        </Text>
      </ReviewPrefixContainer>

      <FlexRowContainer className="misc-info">
        <div>
          <ReviewRating
            maxStars={5}
            filledStars={reviewDetails ? reviewDetails.overallRating : 0}
            readOnly
          >
            <Text variant="subheading" className="rating-text">
              Overall
            </Text>
          </ReviewRating>
          <ReviewRating
            maxStars={5}
            filledStars={reviewDetails ? reviewDetails.meaningfulWorkRating : 0}
            readOnly
          >
            <Text variant="subheading" className="rating-text" color="greyDark">
              Meaningful work
            </Text>
          </ReviewRating>
          <ReviewRating
            maxStars={5}
            filledStars={
              reviewDetails ? reviewDetails.workLifeBalanceRating : 0
            }
            readOnly
          >
            <Text variant="subheading" className="rating-text" color="greyDark">
              Work life balance
            </Text>
          </ReviewRating>
          <ReviewRating
            maxStars={5}
            filledStars={
              reviewDetails ? reviewDetails.learningMentorshipRating : 0
            }
            readOnly
          >
            <Text variant="subheading" className="rating-text" color="greyDark">
              Learning &amp; mentorship
            </Text>
          </ReviewRating>
        </div>
        <SalaryInfo>
          <Text variant="heading2">{reviewDetails?.salary}</Text>
          <Text variant="heading3">{`${
            reviewDetails?.salaryCurrency
          }${getSalaryPeriodText(reviewDetails?.salaryPeriod)}`}</Text>
        </SalaryInfo>
      </FlexRowContainer>
      <ReviewBody variant="body">
        {reviewDetails?.body}
        {/* TODO: is there a way to render new lines without dangerouslySetInnerHTML? don't want to be exposed to XSS */}
      </ReviewBody>
    </div>

    <CloseButton onClick={onExit} tabIndex={1}>
      <span className="bg" />
      <Icon name={IconName.X} color="white" size={13} />
    </CloseButton>
  </DetailsCard>
);

export default ReviewDetailsCard;
