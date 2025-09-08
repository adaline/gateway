import { SelectStringConfigItem } from "@adaline/provider";

const awsRegionChoice = SelectStringConfigItem({
  param: "awsRegion",
  title: "AWS Region",
  description: "Controls which region the model will use to call AWS services.",
  default: "us-east-1",
  choices: [
    "af-south-1", // Africa (Cape Town)
    "ap-east-1", // Asia Pacific (Hong Kong)
    "ap-northeast-1", // Asia Pacific (Tokyo)
    "ap-northeast-2", // Asia Pacific (Seoul)
    "ap-northeast-3", // Asia Pacific (Osaka)
    "ap-south-1", // Asia Pacific (Mumbai)
    "ap-south-2", // Asia Pacific (Hyderabad)
    "ap-southeast-1", // Asia Pacific (Singapore)
    "ap-southeast-2", // Asia Pacific (Sydney)
    "ap-southeast-3", // Asia Pacific (Jakarta)
    "ap-southeast-4", // Asia Pacific (Melbourne)
    "ca-central-1", // Canada (Central)
    "ca-west-1", // Canada (Calgary)
    "cn-north-1", // China (Beijing)
    "cn-northwest-1", // China (Ningxia)
    "eu-central-1", // Europe (Frankfurt)
    "eu-central-2", // Europe (Zurich)
    "eu-north-1", // Europe (Stockholm)
    "eu-south-1", // Europe (Milan)
    "eu-south-2", // Europe (Spain)
    "eu-west-1", // Europe (Ireland)
    "eu-west-2", // Europe (London)
    "eu-west-3", // Europe (Paris)
    "il-central-1", // Israel (Tel Aviv)
    "me-central-1", // Middle East (UAE)
    "me-south-1", // Middle East (Bahrain)
    "mx-central-1", // Mexico (Central)
    "sa-east-1", // South America (São Paulo)
    "us-east-1", // US East (N. Virginia)
    "us-east-2", // US East (Ohio)
    "us-west-1", // US West (N. California)
    "us-west-2", // US West (Oregon)
  ],
});

export { awsRegionChoice };
