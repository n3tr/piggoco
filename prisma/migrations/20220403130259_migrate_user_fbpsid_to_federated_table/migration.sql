INSERT INTO "FederatedAccount" ("userId", subject, provider)
SELECT U.id, U."fbPsId", CAST('FACEBOOK_PAGE' AS "FederationProvider")  FROM "User" U;