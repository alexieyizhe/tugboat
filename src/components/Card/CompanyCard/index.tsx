import React, { useState } from "react";
import styled from "styled-components";
import { Redirect } from "react-router-dom";

import StarRating from "src/components/StarRating";
import Text from "src/components/Text";
import Card, { ICardProps } from "../RawCard";

export interface ICompanyCardProps extends ICardProps {
  name: string | null;
  desc?: string | null;
  logoSrc?: string | null;
  numRatings: number | null;
  avgRating: number | null;
  linkTo: string;
}

// TODO: factor out hover styles into its own css`` variable for reuse
const Container = styled(Card)`
  position: relative;
  display: inline-grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr 80px;
  grid-column-gap: 30px;
  grid-template-areas:
    "name    logo"
    "desc    logo"
    "ratings logo";

  cursor: pointer;
  &::after {
    content: "";
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;

    border-radius: ${({ theme }) => theme.borderRadius.button}px;
    box-shadow: ${({ theme }) => theme.boxShadow.hover};

    transition: opacity 150ms ease-in;
    opacity: 0;
  }

  &:hover::after,
  &:focus::after {
    opacity: 1;
  }

  & > .name {
    grid-area: name;
  }

  & > .logo {
    grid-area: logo;
    margin-left: auto;
    max-width: 100%;
  }

  & > .desc {
    grid-area: desc;
  }

  & > .ratings {
    grid-area: ratings;
    display: flex;
    align-items: flex-end;
  }
`;

const CompanyCard: React.FC<ICompanyCardProps> = ({
  name,
  logoSrc,
  desc,
  numRatings,
  avgRating,
  linkTo,
  ...rest
}) => {
  const [clicked, setClicked] = useState(false);

  if (clicked) {
    return <Redirect push to={linkTo} />;
  }

  return (
    <Container
      role="link"
      onClick={() => setClicked(true)}
      tabIndex={0}
      {...rest}
    >
      <Text className="name" variant="heading2">
        {name}
      </Text>

      {logoSrc && (
        <img className="logo" src={logoSrc} alt={`Logo of ${name}`} />
      )}

      {desc && (
        <Text className="desc" variant="subheading">
          {desc}
        </Text>
      )}

      <div className="ratings">
        <StarRating
          maxStars={5}
          filledStars={Math.round(avgRating || 0)}
          readOnly
        />
        <Text variant="body" color="black">
          {avgRating}
        </Text>
        <Text variant="body" color="greyDark">
          ({numRatings})
        </Text>
      </div>
    </Container>
  );
};

export default CompanyCard;
