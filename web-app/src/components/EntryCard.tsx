import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Text,
  Heading
} from "grommet";
import { Trash, Edit, Calendar, View } from "grommet-icons";
import { Entry } from "interfaces/entry";
import Link from "next/link";

type Mode = {
  preview?: boolean;
};

export const EntryCard = ({
  id,
  title,
  description,
  created_at,
  preview = false
}: Entry & Mode) => {
  const date = new Date(created_at * 1000).toLocaleDateString();

  return (
    <Card background="light-1" margin="8px 8px 16px">
      <CardHeader pad="small" flex direction="column">
        <Heading size="1.5rem" alignSelf="start">
          {title}
        </Heading>

        <Box flex direction="row" justify="center">
          <Calendar />
          <Text margin={{ left: "8px" }}>
            <time dateTime={date}>{date}</time>
          </Text>
        </Box>
      </CardHeader>

      {!preview && <CardBody pad="medium">{description}</CardBody>}

      <CardFooter pad={{ horizontal: "small" }} background="light-2">
        <Link href={`/view/${id}`} passHref>
          <Button as="a" icon={<View color="neutral-1" />} hoverIndicator />
        </Link>

        <Link href={`/edit/${id}`} passHref>
          <Button as="a" icon={<Edit color="neutral-3" />} hoverIndicator />
        </Link>

        <Link href={`/delete/${id}`} passHref>
          <Button as="a" icon={<Trash color="neutral-4" />} hoverIndicator />
        </Link>
      </CardFooter>
    </Card>
  );
};
