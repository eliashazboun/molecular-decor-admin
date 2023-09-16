"use client";

import { FormEvent, useState } from "react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Form } from "./ui/form";
import { FormInput } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Heading } from "./ui/heading";

const MoleculeLookup = () => {
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUrl(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${input}/png`
    );
  };
  return (
    <>
      <div className="">
        <form className="flex" onSubmit={(e) => handleSubmit(e)}>
          <Input
            placeholder="Enter Molecule Name"
            onChange={(e) => setInput(e.target.value)}
            className="flex h-10 w-full rounded-md rounded-r-none border-r-0 border-r-white border focus-visible:ring-0 border-input bg-background px-3 py-2 text-sm  max-w-sm"
          />
          <Button type="submit" className="rounded-l-none">
            Search
          </Button>
        </form>
      </div>
      {url && 
        <Card className="w-fit h-full p-5 relative ">
          <Heading title="Fuck" description="Hi" />
          <Image
            width={"0"}
            height={"0"}
            alt="hi"
            sizes="80vw"
            style={{
              width: "100%",
              height: "fit",
              objectFit: "cover",
              objectPosition: "center",
              aspectRatio: "revert",
            }} // optional
            objectFit="cover"
            src={url}
          />
        </Card>
      }
    </>
  );
};

export default MoleculeLookup;
