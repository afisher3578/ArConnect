import Subscription, {
  type SubscriptionData
} from "~subscriptions/subscription";
import HeadV2 from "~components/popup/HeadV2";
import { useEffect, useState } from "react";
import { getActiveAddress } from "~wallets";
import { ExtensionStorage } from "~utils/storage";
import styled from "styled-components";
import Squircle from "~components/Squircle";
import { getSubscriptionData } from "~subscriptions";
import dayjs from "dayjs";

export default function Subscriptions() {
  const [subData, setSubData] = useState<SubscriptionData[] | null>(null);

  useEffect(() => {
    async function getSubData() {
      const address = await getActiveAddress();

      await ExtensionStorage.set(`subscriptions_${address}`, [
        {
          applicationName: "ArDrive",
          applicationIcon: "tN4vheZxrAIjqCfbs3MDdWTXg8a_57JUNyoqA4uwr1k",
          arweaveAccountAddress: "JNC6vBhjHY1EPwV3pEeNmrsgFMxH5d38_LHsZ7jful8",
          nextPaymentDue: "03-08-2025",
          recurringPaymentFrequency: "Annually",
          subscriptionEndDate: "03-08-2025",
          subscriptionFeeAmount: 25,
          subscriptionName: "Turbo Subscription",
          subscriptionStartData: "03-08-2024",
          subscriptionStatus: "Awaiting payment"
        },
        {
          applicationName: "PermaSwap Pro",
          applicationIcon: "tN4vheZxrAIjqCfbs3MDdWTXg8a_57JUNyoqA4uwr1k",
          arweaveAccountAddress: "JNC6vBhjHY1EPwV3pEeNmrsgFMxH5d38_LHsZ7jful8",
          nextPaymentDue: "",
          recurringPaymentFrequency: "Quarterly",
          subscriptionEndDate: "03-08-2025",
          subscriptionFeeAmount: 25,
          subscriptionName: "PermaSwap Pro Subscription",
          subscriptionStartData: "03-08-2024",
          subscriptionStatus: "Cancelled"
        },
        {
          applicationName: "BARK Pro",
          applicationIcon: "tN4vheZxrAIjqCfbs3MDdWTXg8a_57JUNyoqA4uwr1k",
          arweaveAccountAddress: "JNC6vBhjHY1EPwV3pEeNmrsgFMxH5d38_LHsZ7jful8",
          nextPaymentDue: "03-08-2025",
          recurringPaymentFrequency: "Weekly",
          subscriptionEndDate: "03-08-2025",
          subscriptionFeeAmount: 25,
          subscriptionName: "Turbo Subscription",
          subscriptionStartData: "03-08-2024",
          subscriptionStatus: "Active"
        },
        {
          applicationName: "Coinbase One",
          applicationIcon: "tN4vheZxrAIjqCfbs3MDdWTXg8a_57JUNyoqA4uwr1k",
          arweaveAccountAddress: "JNC6vBhjHY1EPwV3pEeNmrsgFMxH5d38_LHsZ7jful8",
          nextPaymentDue: "",
          recurringPaymentFrequency: "Monthly",
          subscriptionEndDate: "03-08-2025",
          subscriptionFeeAmount: 25,
          subscriptionName: "Turbo Subscription",
          subscriptionStartData: "03-08-2024",
          subscriptionStatus: "Expired"
        }
      ]);

      try {
        const sub = new Subscription(address);
        const data = await getSubscriptionData(address);

        console.log("data: ", data);
        setSubData(data);
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      }
    }
    getSubData();
  }, []);

  return (
    <div>
      <HeadV2 title="Subscriptions" />
      {subData ? (
        <SubscriptionList>
          {subData.map((sub) => {
            return (
              <SubscriptionListItem
                title={sub.applicationName}
                icon={sub.applicationIcon}
                expiration={sub.nextPaymentDue}
                status={sub.subscriptionStatus}
                frequency={sub.recurringPaymentFrequency}
                amount={sub.subscriptionFeeAmount}
              />
            );
          })}
        </SubscriptionList>
      ) : (
        <div>No notifications found</div>
      )}
    </div>
  );
}

const SubscriptionListItem = ({
  title,
  expiration,
  status,
  frequency,
  amount,
  icon
}) => {
  let period: string = "";
  let color: string = "";
  switch (status) {
    case "Active":
      color = "#14D110";
      break;
    case "Cancelled":
      color = "#FF1A1A";
      break;
    case "Awaiting payment":
      color = "#CFB111";
      break;
    default:
      color = "#A3A3A3";
  }

  switch (frequency) {
    case "Weekly":
      period = "week";
      break;
    case "Monthly":
      period = "month";
      break;
    case "Annually":
      period = "year";
      break;
    case "Quarterly":
      period = "quarter";
      break;
    default:
      period = "";
  }
  return (
    <ListItem>
      <Content>
        <AppIcon color="white"></AppIcon>
        <ListDetails>
          <Title>
            <h2>{title}</h2>
            <h3>
              Next payment date:{" "}
              {expiration ? (
                <span>{dayjs(expiration).format("MMM DD, YYYY")} </span>
              ) : (
                "--"
              )}
            </h3>
          </Title>
          <SubscriptionInformation>
            <Status color={color}>
              <StatusCircle color={color} /> {status}
            </Status>
            <div>
              {amount} AR/{period}
            </div>
          </SubscriptionInformation>
        </ListDetails>
      </Content>
    </ListItem>
  );
};

const StatusCircle = ({ color }: { color: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="6"
    viewBox="0 0 6 6"
    fill="none"
  >
    <circle cx="3" cy="3" r="2.5" fill={color} />
  </svg>
);

const Title = styled.div`
  h3 {
    color: #a3a3a3;

    span {
      color: white;
    }
  }
`;

const SubscriptionList = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #333333;
  border-radius: 10px;
  margin: 0 15px;
`;

const ListItem = styled.div`
  padding: 10px 0;
  margin: 0 10px;

  &:not(:last-child) {
    border-bottom: 1px solid rgb(${(props) => props.theme.cardBorder});
  }
`;

const Content = styled.div`
  cursor: pointer;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  h2 {
    margin: 0;
    padding: 0;
    font-weight: 500;
    font-size: 1rem;
  }
  h3 {
    margin: 0;
    padding: 0;
    font-weight: 500;
    font-size: 10px;
  }
`;

const ListDetails = styled.div`
  display: flex;
  height: 100%;
  justify-content: space-between;
  width: 100%;
`;

const SubscriptionInformation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 36px;
  text-align: right;
`;

const Status = styled.p<{ color: string }>`
  margin: 0;
  color: ${(props) => props.color};
  font-size: 10px;
`;

const Image = styled.img`
  width: 16px;
  padding: 0 8px;
  border: 1px solid rgb(${(props) => props.theme.cardBorder});
  border-radius: 2px;
`;

const AppIcon = styled(Squircle)<{ color?: string }>`
  color: ${(props) =>
    props.color ? props.color : "rgb(" + props.theme.theme + ")"};
  width: 2rem;
  height: 2rem;
  cursor: pointer;
`;
