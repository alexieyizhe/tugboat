import React, { useState, useMemo, useEffect, useRef } from "react";
import styled from "styled-components";
import classNames from "classnames";
import { ValueType } from "react-select";
import places, { PlacesInstance, ChangeEvent } from "places.js";

import { useAddReviewModalContext, useMobileMenuContext } from "src/contexts";
import { slugify } from "src/shared/utils/misc";
import { Size } from "src/theme";

import { useCompanySuggestions } from "src/shared/hooks/useCompanySuggestions";
import { useJobSuggestions } from "src/shared/hooks/useJobSuggestions";
import { useAddReview } from "src/shared/hooks/useAddReview";

import {
  Card,
  Text,
  TextInput,
  TextArea,
  Select,
  StarRating,
  Button,
  Tooltip,
  UnstyledButton,
  Spinner,
  baseLinkStyles,
  Checkbox,
} from "src/components";
import {
  HEADER_HEIGHT,
  MOBILE_MENU_HEIGHT,
  MOBILE_MENU_MEDIA_QUERY,
} from "src/components/PageHeader";
import { useOnClickOutside } from "src/shared/hooks/useOnClickOutside";

export interface IAddReviewModalProps
  extends React.ComponentPropsWithoutRef<"div"> {}

/*******************************************************************
 *                  **Utility functions/constants**                *
 *******************************************************************/
const SUBMIT_SUCCESS_TEXT =
  "Thanks for helping your peers stay informed! Your review has been submitted and is pending approval for display.";
const SUBMIT_ERROR_TEXT = "Oops! Something went wrong. Please try again.";

const salaryCurrencyOptions = ["CAD", "USD", "EUR", "JPY"].map((currency) => ({
  label: currency,
  value: currency,
}));
const salaryPeriodOptions = ["hourly", "weekly", "monthly"].map((period) => ({
  label: period,
  value: period,
}));

/*******************************************************************
 *                            **Styles**                           *
 *******************************************************************/
const ModalContainer = styled.div`
  position: fixed;
  width: 650px;
  top: ${HEADER_HEIGHT + 15}px;
  right: ${({ theme }) => theme.padding.pageHorizontal}px;
  z-index: -1;

  &.open {
    z-index: ${({ theme }) => theme.zIndex.modal};
  }

  &.mobile-menu-open {
    top: ${HEADER_HEIGHT + MOBILE_MENU_HEIGHT + 10}px;
  }

  ${({ theme }) => theme.mediaQueries.medium`
    width: calc(100% - ${theme.padding.pageHorizontalMobile * 2}px);
  `}

  ${({ theme }) => theme.mediaQueries[MOBILE_MENU_MEDIA_QUERY]`
    right: ${theme.padding.pageHorizontalMobile}px;
  `}
`;

const InnerContainer = styled(Card)<{ inert?: true }>`
  position: relative;
  margin-left: auto;
  max-width: 100%;
  max-height: 85vh;
  padding: ${({ theme }) => theme.padding.displayMobile};

  display: flex;
  flex-direction: column;

  box-shadow: ${({ theme }) => theme.boxShadow.hover},
    0px 0px 0px 2px ${({ theme }) => theme.color.backgroundSecondary};
  overflow-y: scroll;

  transition: all 100ms ease-out;
  opacity: 0;
  transform: translateY(10px);
  &.open {
    opacity: 1;
    transform: translateY(0);
  }

  & > * {
    margin-top: 20px;
  }

  &.isConfirmingSubmit article {
    opacity: 0.6;
  }

  ${({ theme }) => theme.mediaQueries.tablet`
    padding: ${theme.padding.displayMobile};
    max-height: 70vh;
  `}

  ${({ theme }) => theme.mediaQueries.xlMobile`
    margin: auto;  
    right: unset;
  `}
`;

const RowContainer = styled.div`
  margin: 5px 0;

  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  flex-shrink: 0;
`;

const Field = styled.article`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  margin: 5px 0 10px 0;

  width: 100%;

  &.half-width {
    width: 47%;
  }

  &.error h4 {
    color: ${({ theme }) => theme.color.error} !important;
  }

  ${({ theme }) => theme.mediaQueries.xlMobile`
    width: 100% !important;
  `}
`;

const VerticalField = styled(Field)`
  flex-direction: column;

  & .label {
    margin-bottom: 6px;
  }
`;

const HorizontalField = styled(Field)`
  align-items: center;

  & .label {
    margin-right: 8px;
  }
`;

const LocationField = styled(VerticalField)`
  width: 30%;
`;

const SalaryField = styled(VerticalField)`
  position: relative;
  width: 64%;

  & > div {
    width: 100%;
    display: flex;
    justify-content: space-between;

    & .salary-amt {
      width: 32%;
    }
    & .salary-currency {
      width: 28%;
    }
    & .salary-period {
      width: 35%;
    }
  }

  & .no-salary-provided-checkbox {
    margin-top: 6px;
  }

  ${({ theme }) => theme.mediaQueries.xlMobile`
    & > div {
      flex-direction: column;

      & > * {
        width: 100% !important;
        margin-bottom: 8px;
      }
    }
  `}
`;

const LabelTooltipCombo = styled.div`
  display: flex;
  align-items: center;

  & .tooltip {
    margin-left: 6px;
  }
`;

const ActionContainer = styled.div`
  position: relative;
  margin: 25px auto 10px auto;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  flex-shrink: 0;

  & .cancel-submit-button {
    margin-top: 5px;
    visibility: hidden;
    ${baseLinkStyles}
  }

  &.confirming-submit .cancel-submit-button {
    visibility: visible;
  }
`;

const LocationInput = styled(TextInput)`
  height: auto;

  & ~ .ap-icon-pin,
  & ~ .ap-icon-clear {
    display: none;
  }

  & ~ .ap-dropdown-menu {
    margin-top: 6px;

    border-radius: ${({ theme }) => theme.borderRadius.large}px;
    background-color: ${({ theme }) => theme.color.backgroundSecondary};
    box-shadow: ${({ theme }) => theme.boxShadow.hover};

    font-family: ${({ theme }) => theme.fontFamily.body};
    font-size: ${({ theme }) => theme.fontSize[Size.SMALL]}px;

    & .ap-suggestion {
      height: 40px;
      line-height: 40px;

      & .ap-name {
        color: ${({ theme }) => theme.color.textSecondary};
      }

      &.ap-cursor {
        & .ap-name {
          color: ${({ theme }) => theme.color.textPrimary};
        }
      }
    }

    & .ap-suggestion-icon {
      display: none;
    }

    & .ap-footer {
      font-size: 0;

      & > * {
        display: none;
      }

      & > a:first-child {
        display: inherit;
        opacity: 0.6;
        margin-right: 10px;

        & > svg {
          height: 15px;
        }
      }
    }
  }
`;

const CountText = styled(Text)`
  margin-top: 5px;
  margin-left: auto;
`;

const ErrorText = styled(Text)`
  margin-top: 8px;
  visibility: hidden;

  &.error {
    visibility: visible;
  }
`;

const SubmittedText = styled(Text)`
  margin: auto;
`;

const ActionButton = styled(Button)`
  min-width: 100px;
  transition: all 100ms ease;

  display: flex;
  justify-content: center;
`;

/*******************************************************************
 *                           **Component**                         *
 *******************************************************************/
const AddReviewModal: React.FC<IAddReviewModalProps> = () => {
  const {
    isAddReviewModalOpen,
    setAddReviewModalOpen,
  } = useAddReviewModalContext();
  const { isMobileMenuOpen } = useMobileMenuContext();

  const {
    reviewState,
    onReviewChange,
    onReviewPotentialSubmit,
    onReviewSubmit,
  } = useAddReview();

  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const onPotentialSubmit = () => {
    const isValid = onReviewPotentialSubmit();

    if (isValid) {
      setIsConfirmingSubmit(true);
    }
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await onReviewSubmit();

      if (success) {
        setSubmitSuccess(true);
      }
    } catch (e) {
      console.error("error", e);
    } finally {
      setSubmitted(true);
    }
  };

  /**
   * Deal with closing modal if successful submission.
   */
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let resetTimeout: NodeJS.Timeout;
    if (submitted) {
      if (submitSuccess) {
        timeout = global.setTimeout(() => setAddReviewModalOpen(false), 4000);
      }

      resetTimeout = global.setTimeout(() => {
        setSubmitted(false);
        setIsSubmitting(false);
        setIsConfirmingSubmit(false);
      }, 5000);
    }

    return () => {
      clearTimeout(timeout);
      clearTimeout(resetTimeout);
    };
  }, [setAddReviewModalOpen, submitSuccess, submitted]);

  /**
   * Create options for selections.
   */
  const { suggestions: companySuggestions } = useCompanySuggestions(
    !isAddReviewModalOpen
  );
  const { suggestions: jobSuggestions } = useJobSuggestions(
    reviewState.values.company?.value, // company slug
    !isAddReviewModalOpen
  );
  const companyOptions = useMemo(
    () =>
      companySuggestions.map(({ name, slug }) => ({
        label: name || "",
        value: slug || "",
      })),
    [companySuggestions]
  );
  const jobOptions = useMemo(
    () =>
      jobSuggestions.map(({ name, location, id }) => ({
        label: `${name} (${location})`,
        value: id || "",
      })),
    [jobSuggestions]
  );

  /**
   * Logic for tags input
   */
  const [tagsInputValue, setTagsInputValue] = useState<string | undefined>(
    undefined
  );
  const onTagsInputChange = (inputValue: string) => {
    if ((reviewState.values["tags"]?.length || 0) < 5)
      setTagsInputValue(inputValue);
  };
  const onTagsChange = (value: ValueType<{ label: string; value: string }>) =>
    onReviewChange("tags", value);
  const onTagsKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!tagsInputValue) return;
    switch (event.key) {
      case "Enter":
      case " ":
        // check if tag exists already - if so, don't add another tag
        if (
          !reviewState.values.tags?.some((tag) => tag.label === tagsInputValue)
        ) {
          onReviewChange("tags", [
            ...(reviewState.values["tags"] || []),
            { label: tagsInputValue, value: slugify(tagsInputValue) },
          ]);
        }

        setTagsInputValue("");
        event.preventDefault();
    }
  };

  /**
   * Automatically close the review modal when clicking outside,
   * since it obstructs visibility.
   */
  const modalRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(modalRef, () => setAddReviewModalOpen(false));

  /**
   * Prompt user about unsaved review if they attempt
   * to navigate away from site without submitting.
   */
  useEffect(() => {
    const promptUnsaved = (e: BeforeUnloadEvent) => {
      const reviewStarted = Object.values(reviewState.values).some(
        (val) => !!val
      );

      if (reviewStarted) {
        // display prompt, user has unsubmitted stuff
        e.preventDefault();
        e.returnValue = true;
      }
    };
    window.addEventListener("beforeunload", promptUnsaved);

    return () => window.removeEventListener("beforeunload", promptUnsaved);
  }, [reviewState.values]);

  /**
   * Suggestions for location input
   */
  const [placesInstance, setPlacesInstance] = useState<PlacesInstance | null>(
    null
  );
  useEffect(() => {
    const placesAutocomplete = places({
      appId: "pl5ATJBYI7TR",
      apiKey: "40b345052d7ae04dd2af77ff04180a28",
      container: "#location-input",
      type: "city",
    });

    setPlacesInstance(placesAutocomplete);
  }, []);

  useEffect(() => {
    const updateLocation = (e: ChangeEvent) =>
      onReviewChange("location", e.suggestion.value);

    if (placesInstance) {
      placesInstance.on("change", updateLocation);
    }

    return () => {
      if (placesInstance) {
        (placesInstance as any).off("change", updateLocation); // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    };
  }, [onReviewChange, placesInstance]);

  return (
    <ModalContainer
      className={classNames({
        open: isAddReviewModalOpen,
        "mobile-menu-open": isMobileMenuOpen,
      })}
      ref={modalRef}
    >
      <InnerContainer
        id="add-review-modal"
        className={classNames({
          open: isAddReviewModalOpen,
          isConfirmingSubmit,
        })}
        aria-hidden={isAddReviewModalOpen ? "false" : "true"}
        inert={isAddReviewModalOpen ? true : undefined}
        color="backgroundPrimary"
      >
        {submitted ? (
          <SubmittedText
            variant="subheading"
            color={submitSuccess ? "greenPrimary" : "error"}
            align="center"
          >
            {submitSuccess ? SUBMIT_SUCCESS_TEXT : SUBMIT_ERROR_TEXT}
          </SubmittedText>
        ) : (
          <>
            <Text variant="heading2">Write a review</Text>
            <RowContainer>
              <VerticalField
                className={classNames("half-width", "company-field", {
                  error: reviewState.errors["company"].error,
                })}
              >
                <Text
                  variant="subheading"
                  className="label"
                  as="h4"
                  color="textSecondary"
                >
                  Company name*
                </Text>
                <Select
                  placeholder="Search or create"
                  color="backgroundSecondary"
                  disabled={isConfirmingSubmit || isSubmitting}
                  creatable
                  options={companyOptions}
                  value={reviewState.values["company"]}
                  onChange={(option) => onReviewChange("company", option)}
                  tabIndex={isAddReviewModalOpen ? "0" : "-1"}
                />
              </VerticalField>
              <VerticalField
                className={classNames("half-width", "job-field", {
                  error: reviewState.errors["job"].error,
                })}
              >
                <LabelTooltipCombo className="label">
                  <Text variant="subheading" as="h4" color="textSecondary">
                    Position title*
                  </Text>
                  <Tooltip color="textTertiary">
                    <Text variant="body" as="div">
                      The name of the position in your review. If the position
                      doesn't exist, create one using the 'Create' option.
                    </Text>
                    {!reviewState.values["company"]?.value && (
                      <>
                        <br />
                        <Text variant="body" as="div" color="warning">
                          Select a company first before choosing a position.
                        </Text>
                      </>
                    )}
                  </Tooltip>
                </LabelTooltipCombo>
                <Select
                  placeholder={
                    !reviewState.values["company"]?.value
                      ? "Select company first"
                      : "Search or create"
                  }
                  color="backgroundSecondary"
                  disabled={
                    isConfirmingSubmit ||
                    isSubmitting ||
                    !reviewState.values["company"]?.value
                  }
                  creatable
                  options={jobOptions}
                  value={reviewState.values["job"] || null}
                  onChange={(option) => {
                    onReviewChange("job", option);
                    onReviewChange(
                      "location",
                      jobSuggestions.find(
                        (job) =>
                          job.id ===
                          (option as { label: string; value: string })?.value
                      )?.location
                    );
                  }}
                  tabIndex={isAddReviewModalOpen ? "0" : "-1"}
                />
              </VerticalField>
            </RowContainer>
            <RowContainer>
              <LocationField
                className={classNames("location-field", {
                  error: reviewState.errors["location"]?.error,
                })}
              >
                <Text
                  variant="subheading"
                  className="label"
                  as="h4"
                  color="textSecondary"
                >
                  Location*
                </Text>
                <LocationInput
                  id="location-input"
                  placeholder="e.g. Waterloo, ON"
                  color="backgroundSecondary"
                  disabled={
                    isConfirmingSubmit ||
                    isSubmitting ||
                    (!!reviewState.values["job"] &&
                      !reviewState.values["job"]?.__isNew__)
                  }
                  value={reviewState.values["location"] || ""}
                  onChange={(e) => onReviewChange("location", e.target.value)}
                  tabIndex={isAddReviewModalOpen ? 0 : -1}
                />
              </LocationField>
              <SalaryField
                className={classNames("salary-field", {
                  error:
                    reviewState.errors["salary"].error ||
                    reviewState.errors["salaryCurrency"].error ||
                    reviewState.errors["salaryPeriod"].error,
                })}
              >
                <Text
                  variant="subheading"
                  className="label"
                  as="h4"
                  color="textSecondary"
                >
                  Salary*
                </Text>
                <div>
                  <TextInput
                    className="salary-amt"
                    placeholder="Amount"
                    type="number"
                    min={0}
                    color="backgroundSecondary"
                    disabled={
                      isConfirmingSubmit ||
                      isSubmitting ||
                      reviewState.values.noSalaryProvided
                    }
                    value={reviewState.values["salary"]}
                    onChange={(e) =>
                      onReviewChange("salary", parseInt(e.target.value))
                    }
                    tabIndex={isAddReviewModalOpen ? 0 : -1}
                  />
                  <Select
                    className="salary-currency"
                    placeholder="$€¥"
                    color="backgroundSecondary"
                    disabled={
                      isConfirmingSubmit ||
                      isSubmitting ||
                      reviewState.values.noSalaryProvided
                    }
                    creatable
                    options={salaryCurrencyOptions}
                    value={salaryCurrencyOptions.find(
                      (option) =>
                        option.value ===
                        reviewState.values["salaryCurrency"]?.value
                    )}
                    onChange={(option) =>
                      onReviewChange("salaryCurrency", option)
                    }
                    tabIndex={isAddReviewModalOpen ? "0" : "-1"}
                  />
                  <Select
                    className="salary-period"
                    placeholder="Period"
                    color="backgroundSecondary"
                    disabled={
                      isConfirmingSubmit ||
                      isSubmitting ||
                      reviewState.values.noSalaryProvided
                    }
                    options={salaryPeriodOptions}
                    value={salaryPeriodOptions.find(
                      (option) =>
                        option.value === reviewState.values["salaryPeriod"]
                    )}
                    onChange={(option) =>
                      onReviewChange(
                        "salaryPeriod",
                        (option as { value: string })?.value
                      )
                    }
                    tabIndex={isAddReviewModalOpen ? "0" : "-1"}
                  />
                </div>
                <Checkbox
                  className="no-salary-provided-checkbox"
                  color="backgroundSecondary"
                  checked={reviewState.values.noSalaryProvided}
                  onChange={(e) =>
                    onReviewChange("noSalaryProvided", e.target.checked)
                  }
                  tabIndex={isAddReviewModalOpen ? 0 : -1}
                >
                  <Text variant="body" color="textSecondary">
                    I do not wish to disclose my salary.
                  </Text>
                </Checkbox>
              </SalaryField>
            </RowContainer>
            <RowContainer>
              <HorizontalField
                className={classNames("half-width", "overall-rating-field", {
                  error: reviewState.errors["overallRating"].error,
                })}
              >
                <Text
                  variant="subheading"
                  className="label"
                  as="h4"
                  color="textSecondary"
                >
                  Overall rating*
                </Text>
                <StarRating
                  maxStars={5}
                  value={reviewState.values["overallRating"]}
                  onChange={(stars) => onReviewChange("overallRating", stars)}
                  disabled={isConfirmingSubmit || isSubmitting}
                  golden
                  tabIndex={isAddReviewModalOpen ? 0 : -1}
                />
              </HorizontalField>
              <HorizontalField
                className={classNames(
                  "half-width",
                  "work-life-balance-rating-field",
                  {
                    error: reviewState.errors["workLifeBalanceRating"].error,
                  }
                )}
              >
                <Text
                  variant="subheading"
                  className="label"
                  as="h4"
                  color="textSecondary"
                >
                  Work-life balance*
                </Text>
                <StarRating
                  maxStars={5}
                  value={reviewState.values["workLifeBalanceRating"]}
                  onChange={(stars) =>
                    onReviewChange("workLifeBalanceRating", stars)
                  }
                  disabled={isConfirmingSubmit || isSubmitting}
                />
              </HorizontalField>

              <HorizontalField
                className={classNames(
                  "half-width",
                  "learning-mentorship-rating-field",
                  {
                    error: reviewState.errors["learningMentorshipRating"].error,
                  }
                )}
              >
                <Text
                  variant="subheading"
                  className="label"
                  as="h4"
                  color="textSecondary"
                >
                  Learning &amp; mentorship*
                </Text>
                <StarRating
                  maxStars={5}
                  value={reviewState.values["learningMentorshipRating"]}
                  onChange={(stars) =>
                    onReviewChange("learningMentorshipRating", stars)
                  }
                  disabled={isConfirmingSubmit || isSubmitting}
                />
              </HorizontalField>
              <HorizontalField
                className={classNames(
                  "half-width",
                  "meaningful-work-rating-field",
                  {
                    error: reviewState.errors["meaningfulWorkRating"].error,
                  }
                )}
              >
                <Text
                  variant="subheading"
                  className="label"
                  as="h4"
                  color="textSecondary"
                >
                  Meaningful work*
                </Text>
                <StarRating
                  maxStars={5}
                  value={reviewState.values["meaningfulWorkRating"]}
                  onChange={(stars) =>
                    onReviewChange("meaningfulWorkRating", stars)
                  }
                  disabled={isConfirmingSubmit || isSubmitting}
                />
              </HorizontalField>
            </RowContainer>
            <RowContainer>
              <VerticalField
                className={classNames("review-body-field", {
                  error: reviewState.errors["body"]?.error,
                })}
              >
                <Text
                  variant="subheading"
                  className="label"
                  as="h4"
                  color="textSecondary"
                >
                  Review*
                </Text>
                <TextArea
                  placeholder="Share your thoughts"
                  color="backgroundSecondary"
                  disabled={isConfirmingSubmit || isSubmitting}
                  value={reviewState.values["body"]}
                  onChange={(e) => onReviewChange("body", e.target.value)}
                  maxLength={5000}
                  tabIndex={isAddReviewModalOpen ? 0 : -1}
                />
                <CountText variant="subheading" color="textSecondary">
                  {`${4000 - (reviewState.values["body"]?.length || 0)}/4000`}
                </CountText>
              </VerticalField>
            </RowContainer>
            <RowContainer>
              <VerticalField
                className={classNames("tags-field", {
                  error: reviewState.errors["tags"]?.error,
                })}
              >
                <LabelTooltipCombo className="label">
                  <Text variant="subheading" as="h4" color="textSecondary">
                    Tags
                  </Text>
                  <Tooltip position="right" color="textTertiary">
                    <Text variant="body" as="div">
                      Optional keywords related to your review. Maximum of 5.
                    </Text>
                  </Tooltip>
                </LabelTooltipCombo>
                <Select
                  placeholder="e.g. hardware, startup"
                  color="backgroundSecondary"
                  components={{ DropdownIndicator: null }}
                  disabled={isConfirmingSubmit || isSubmitting}
                  creatable
                  isClearable
                  isMulti
                  menuIsOpen={false}
                  onChange={onTagsChange}
                  onKeyDown={onTagsKeyDown}
                  onInputChange={onTagsInputChange}
                  value={reviewState.values["tags"]}
                  inputValue={tagsInputValue}
                  tabIndex={isAddReviewModalOpen ? "0" : "-1"}
                />
                <CountText variant="subheading" color="textSecondary">
                  {`${5 - (reviewState.values["tags"]?.length || 0)}/5`}
                </CountText>
              </VerticalField>
            </RowContainer>
            <RowContainer>
              <VerticalField
                className={classNames("author-email-field", {
                  error: reviewState.errors["authorEmail"]?.error,
                })}
              >
                <LabelTooltipCombo className="label">
                  <Text variant="subheading" as="h4" color="textSecondary">
                    Email*
                  </Text>
                  <Tooltip position="right" color="textTertiary">
                    <Text variant="body" as="div">
                      Your email will only be used for spam prevention.
                    </Text>
                  </Tooltip>
                </LabelTooltipCombo>

                <TextInput
                  color="backgroundSecondary"
                  placeholder="jimothy@example.com"
                  type="email"
                  disabled={isConfirmingSubmit || isSubmitting}
                  value={reviewState.values["authorEmail"]}
                  onChange={(e) =>
                    onReviewChange("authorEmail", e.target.value)
                  }
                  tabIndex={isAddReviewModalOpen ? 0 : -1}
                />
              </VerticalField>
            </RowContainer>
            <ActionContainer
              className={classNames({
                "confirming-submit": isConfirmingSubmit,
              })}
            >
              <ActionButton
                className="submit-button"
                color={
                  isSubmitting
                    ? "textTertiary"
                    : isConfirmingSubmit
                    ? "greenSecondary"
                    : "textPrimary"
                }
                disabled={isSubmitting}
                onClick={isConfirmingSubmit ? onSubmit : onPotentialSubmit}
                tabIndex={isAddReviewModalOpen ? 0 : -1}
              >
                {isSubmitting ? (
                  <Spinner color="backgroundPrimary" size={16} />
                ) : (
                  <Text variant="subheading" color="backgroundPrimary">
                    {isConfirmingSubmit ? "Confirm" : "Submit"}
                  </Text>
                )}
              </ActionButton>

              {isConfirmingSubmit ? (
                <UnstyledButton
                  className="cancel-submit-button"
                  onClick={() => setIsConfirmingSubmit(false)}
                  aria-hidden={isConfirmingSubmit ? "false" : "true"}
                >
                  <Text
                    variant="subheading"
                    color="textSecondary"
                    align="center"
                  >
                    cancel
                  </Text>
                </UnstyledButton>
              ) : (
                <ErrorText
                  variant="subheading"
                  color="error"
                  align="center"
                  className={classNames({
                    error: Object.values(reviewState.errors).some(
                      (val) => val?.error
                    ),
                  })}
                >
                  Please make sure you've filled out all fields correctly.
                </ErrorText>
              )}
            </ActionContainer>
          </>
        )}
      </InnerContainer>
    </ModalContainer>
  );
};

export default React.memo(AddReviewModal);
