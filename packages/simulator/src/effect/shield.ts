import { EffectHandler } from "./interface";

export const onEffectShieldChange: EffectHandler<"Shield"> = async ({
  preValue,
  value,
}) => {
  // nothing happen on shield change
};
