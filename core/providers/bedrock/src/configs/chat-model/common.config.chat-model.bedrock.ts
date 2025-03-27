import { SelectStringConfigItem } from "@adaline/provider";

const awsRegionChoice = SelectStringConfigItem({
  param: "awsRegion",
  title: "AWS Region",
  description: "Controls which region the model will use to call AWS services.",
  default: "us-east-1",
  choices: [
    "us-east-1", // US East (N. Virginia)
    "us-west-2", // US West (Oregon)
    "eu-west-1", // EU (Ireland)
    "eu-west-3", // EU (Paris)
    "eu-central-1", // EU (Frankfurt)
    "ap-south-3", // Asia Pacific (Mumbai)
    "ap-southeast-1", // Asia Pacific (Singapore)
    "ap-southeast-2", // Asia Pacific (Sydney)
    "ap-northeast-1", // Asia Pacific (Tokyo)
  ],
});

export { awsRegionChoice };
